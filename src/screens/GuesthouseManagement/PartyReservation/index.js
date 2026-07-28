import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import hostMeetApi from '@utils/api/hostMeetApi';
import CheckIcon from '@assets/images/check_orange.svg';
import ChevronRightIcon from '@assets/images/chevron_right_orange.svg';
import ReservationCheck from './ReservationCheck';
import Settings from './Settings';
import styles from './PartyReservation.styles';

const chips = ['신청 관리', '설정'];
const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const formatPartyDate = value => {
  const [year, month, day] = String(value).split('-').map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);
  return `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')} (${
    DAY_LABELS[date.getDay()]
  })`;
};

const getApplicationTypeLabel = value =>
  value === 'ADVANCE' ? '사전 신청' : '당일 신청';

const getPartyStatusLabel = value => {
  switch (value) {
    case 'RECRUIT_BEFORE':
      return '모집 전';
    case 'RECRUIT':
      return '모집 중';
    case 'CANCELLED':
    case 'CANCELED':
      return '취소';
    case 'CLOSED':
    case 'FINISHED':
      return '마감';
    default:
      return value || '-';
  }
};

const PartyReservation = ({
  guesthouseId,
  initialTemplateId,
  initialPartyId,
  initialReservationId,
}) => {
  const [activeChip, setActiveChip] = useState(chips[0]);
  const [partyTemplates, setPartyTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [isTemplateLoading, setIsTemplateLoading] = useState(true);
  const [isPartySelectorOpen, setIsPartySelectorOpen] = useState(false);
  const [applicationType, setApplicationType] = useState(null);
  const [dailyParties, setDailyParties] = useState([]);
  const [selectedPartyId, setSelectedPartyId] = useState(null);
  const [isDailyPartyLoading, setIsDailyPartyLoading] = useState(false);
  const resolvedNotificationPartyRef = useRef(null);
  const dateSelectorScrollRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPartyTemplates = async () => {
      if (!guesthouseId) {
        setPartyTemplates([]);
        setSelectedTemplateId(null);
        setIsPartySelectorOpen(false);
        setIsTemplateLoading(false);
        return;
      }

      setIsTemplateLoading(true);
      setPartyTemplates([]);
      setSelectedTemplateId(null);
      setIsPartySelectorOpen(false);

      try {
        const response = await hostMeetApi.getMyParties();
        const rawTemplates = response?.data;
        const templates = (
          Array.isArray(rawTemplates)
            ? rawTemplates
            : rawTemplates?.content ?? []
        ).filter(
          template =>
            String(template?.guesthouseId) === String(guesthouseId) &&
            template?.templateId != null,
        );

        if (!isMounted) {
          return;
        }

        setPartyTemplates(templates);
        setSelectedTemplateId(prev => {
          const notifiedTemplateExists = templates.some(
            template =>
              String(template.templateId) === String(initialTemplateId),
          );
          if (notifiedTemplateExists) {
            return initialTemplateId;
          }

          const previousExists = templates.some(
            template => String(template.templateId) === String(prev),
          );
          if (previousExists) {
            return prev;
          }

          return templates[0]?.templateId ?? null;
        });
      } catch (error) {
        if (isMounted) {
          setPartyTemplates([]);
          setSelectedTemplateId(null);
        }
      } finally {
        if (isMounted) {
          setIsTemplateLoading(false);
        }
      }
    };

    fetchPartyTemplates();

    return () => {
      isMounted = false;
    };
  }, [guesthouseId, initialTemplateId]);

  const selectedTemplate = partyTemplates.find(
    template => String(template.templateId) === String(selectedTemplateId),
  );
  const selectedDailyParty = useMemo(
    () =>
      dailyParties.find(
        party => String(party.partyId) === String(selectedPartyId),
      ) ?? null,
    [dailyParties, selectedPartyId],
  );
  const effectiveApplicationType =
    applicationType ??
    selectedTemplate?.applicationType ??
    (dailyParties.length > 1 ? 'ADVANCE' : null);
  const isAdvanceApplication = effectiveApplicationType === 'ADVANCE';

  useEffect(() => {
    if (
      !isAdvanceApplication ||
      initialPartyId == null ||
      String(selectedPartyId) !== String(initialPartyId)
    ) {
      return;
    }

    const selectedIndex = dailyParties.findIndex(
      party => String(party.partyId) === String(initialPartyId),
    );
    if (selectedIndex < 0) {
      return;
    }

    const scrollTimer = setTimeout(() => {
      dateSelectorScrollRef.current?.scrollTo({
        x: Math.max(0, selectedIndex * 140),
        animated: true,
      });
    }, 100);

    return () => clearTimeout(scrollTimer);
  }, [
    dailyParties,
    initialPartyId,
    isAdvanceApplication,
    selectedPartyId,
  ]);

  useEffect(() => {
    if (!selectedTemplateId) {
      setApplicationType(null);
      setDailyParties([]);
      setSelectedPartyId(null);
      setIsDailyPartyLoading(false);
      return;
    }

    let isMounted = true;

    const fetchDailyParties = async () => {
      try {
        setIsDailyPartyLoading(true);
        setApplicationType(null);
        setDailyParties([]);
        setSelectedPartyId(null);

        const response =
          await hostMeetApi.getTemplateDailyParties(selectedTemplateId);
        const data = response?.data ?? {};
        const parties = (Array.isArray(data?.parties) ? data.parties : [])
          .filter(
            party =>
              party?.partyId != null && typeof party?.partyDate === 'string',
          )
          .sort((a, b) => a.partyDate.localeCompare(b.partyDate));

        if (!isMounted) {
          return;
        }

        setApplicationType(
          data?.applicationType ??
            selectedTemplate?.applicationType ??
            (parties.length > 1 ? 'ADVANCE' : 'SAME_DAY'),
        );
        setDailyParties(parties);
        setSelectedPartyId(
          parties.find(
            party => String(party.partyId) === String(initialPartyId),
          )?.partyId ??
            parties[0]?.partyId ??
            null,
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setApplicationType(selectedTemplate?.applicationType ?? null);
        setDailyParties([]);
        setSelectedPartyId(null);
      } finally {
        if (isMounted) {
          setIsDailyPartyLoading(false);
        }
      }
    };

    fetchDailyParties();

    return () => {
      isMounted = false;
    };
  }, [
    initialPartyId,
    selectedTemplate?.applicationType,
    selectedTemplateId,
  ]);

  useEffect(() => {
    if (
      !initialPartyId ||
      initialTemplateId ||
      !partyTemplates.length ||
      String(resolvedNotificationPartyRef.current) === String(initialPartyId)
    ) {
      return;
    }

    let isMounted = true;

    const resolveNotificationParty = async () => {
      const results = await Promise.all(
        partyTemplates.map(async template => {
          try {
            const response = await hostMeetApi.getTemplateDailyParties(
              template.templateId,
            );
            const parties = Array.isArray(response?.data?.parties)
              ? response.data.parties
              : [];
            return {template, parties};
          } catch (error) {
            return null;
          }
        }),
      );

      if (!isMounted) {
        return;
      }

      const matched = results.find(result =>
        result?.parties?.some(
          party => String(party.partyId) === String(initialPartyId),
        ),
      );

      if (!matched) {
        return;
      }

      resolvedNotificationPartyRef.current = initialPartyId;
      setSelectedTemplateId(matched.template.templateId);
    };

    resolveNotificationParty();

    return () => {
      isMounted = false;
    };
  }, [initialPartyId, initialTemplateId, partyTemplates]);

  const handleUpdateDailyParty = updates => {
    if (!selectedPartyId) {
      return;
    }
    setDailyParties(prev =>
      prev.map(party =>
        String(party.partyId) === String(selectedPartyId)
          ? {...party, ...updates}
          : party,
      ),
    );
  };
  const handleReservationApproved = partyId => {
    setDailyParties(prev =>
      prev.map(party =>
        String(party.partyId) === String(partyId)
          ? {
              ...party,
              numOfAttendance: (Number(party.numOfAttendance) || 0) + 1,
            }
          : party,
      ),
    );
  };
  const handleUpdateTemplate = updates => {
    if (!selectedTemplateId) {
      return;
    }
    setPartyTemplates(prev =>
      prev.map(template =>
        String(template.templateId) === String(selectedTemplateId)
          ? {...template, ...updates}
          : template,
      ),
    );
  };

  return (
    <View style={styles.container}>
      {!isTemplateLoading && selectedTemplate ? (
        <View style={styles.partySelector}>
          <Text style={[FONTS.fs_12_medium, styles.sectionLabel]}>
            현재 관리 중인 파티
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.partyManagementCard}
            onPress={() => {
              if (partyTemplates.length > 1) {
                setIsPartySelectorOpen(true);
              }
            }}>
            <View style={styles.partyManagementContent}>
              <Text
                numberOfLines={1}
                style={[FONTS.fs_16_semibold, styles.selectedPartyTitle]}>
                {selectedTemplate?.partyTitle || '파티를 선택해주세요'}
              </Text>
              {effectiveApplicationType ? (
                <View style={styles.applicationTypeBadge}>
                  <Text
                    style={[
                      FONTS.fs_12_medium,
                      styles.applicationTypeBadgeText,
                    ]}>
                    {getApplicationTypeLabel(effectiveApplicationType)}
                  </Text>
                </View>
              ) : null}
            </View>
            {partyTemplates.length > 1 ? (
              <View style={styles.changePartyButton}>
                <Text style={[FONTS.fs_12_medium, styles.changePartyText]}>
                  변경
                </Text>
                <ChevronRightIcon width={14} height={14} />
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      ) : null}

      {isAdvanceApplication && dailyParties.length > 0 ? (
        <View style={styles.dateSelectorSection}>
          <Text style={[FONTS.fs_12_medium, styles.dateSelectorLabel]}>
            관리할 날짜
          </Text>
          <ScrollView
            ref={dateSelectorScrollRef}
            style={styles.dateSelectorScroll}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateSelectorContent}>
            {dailyParties.map(party => {
              const isSelected =
                String(party.partyId) === String(selectedPartyId);
              return (
                <TouchableOpacity
                  key={String(party.partyId)}
                  activeOpacity={0.8}
                  style={[
                    styles.dateOption,
                    isSelected && styles.dateOptionSelected,
                  ]}
                  onPress={() => setSelectedPartyId(party.partyId)}>
                  <Text
                    style={[
                      FONTS.fs_14_semibold,
                      styles.dateOptionDate,
                      isSelected && styles.dateOptionTextSelected,
                    ]}>
                    {formatPartyDate(party.partyDate)}
                  </Text>
                  <View style={styles.dateOptionMetaRow}>
                    <Text
                      style={[
                        FONTS.fs_12_medium,
                        styles.dateOptionCount,
                        isSelected && styles.dateOptionTextSelected,
                      ]}>
                      {Number(party.numOfAttendance) || 0}/
                      {Number(party.maxAttendance) || 0}명
                    </Text>
                    <Text
                      style={[
                        FONTS.fs_12_medium,
                        styles.dateOptionStatus,
                        isSelected && styles.dateOptionTextSelected,
                      ]}>
                      · {getPartyStatusLabel(party.partyStatus)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.chipRow}>
        {chips.map(chip => (
          <TouchableOpacity
            key={chip}
            activeOpacity={0.8}
            style={[styles.chip, activeChip === chip && styles.chipActive]}
            onPress={() => setActiveChip(chip)}>
            <Text
              style={[
                FONTS.fs_14_medium,
                activeChip === chip ? styles.chipTextActive : styles.chipText,
              ]}>
              {chip}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isTemplateLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary_orange} />
        </View>
      ) : activeChip === chips[0] ? (
        <ReservationCheck
          key={`reservation-${selectedTemplateId ?? 'default'}`}
          guesthouseId={guesthouseId}
          applicationType={effectiveApplicationType}
          dailyParties={dailyParties}
          selectedDailyParty={selectedDailyParty}
          isDailyPartyLoading={isDailyPartyLoading}
          initialReservationId={initialReservationId}
          onReservationApproved={handleReservationApproved}
        />
      ) : (
        <Settings
          key={`settings-${selectedTemplateId ?? 'default'}`}
          guesthouseId={guesthouseId}
          selectedTemplateId={selectedTemplateId}
          selectedTemplate={selectedTemplate}
          selectedDailyParty={selectedDailyParty}
          isDailyPartyLoading={isDailyPartyLoading}
          onUpdateDailyParty={handleUpdateDailyParty}
          onUpdateTemplate={handleUpdateTemplate}
        />
      )}

      <Modal
        visible={isPartySelectorOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsPartySelectorOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setIsPartySelectorOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.partySelectorModal}>
                <View style={styles.modalHandle} />
                <View style={styles.modalHeader}>
                  <Text style={[FONTS.fs_18_semibold, styles.modalTitle]}>
                    관리할 파티 선택
                  </Text>
                  <Text style={[FONTS.fs_12_medium, styles.modalDescription]}>
                    선택한 파티의 신청 현황과 설정을 확인할 수 있어요
                  </Text>
                </View>

                <ScrollView
                  style={styles.partyOptionScroll}
                  showsVerticalScrollIndicator={false}>
                  {partyTemplates.map(template => {
                    const isSelected =
                      String(template.templateId) ===
                      String(selectedTemplateId);

                    return (
                      <TouchableOpacity
                        key={String(template.templateId)}
                        activeOpacity={0.8}
                        style={[
                          styles.partyOption,
                          isSelected && styles.partyOptionSelected,
                        ]}
                        onPress={() => {
                          setSelectedTemplateId(template.templateId);
                          setIsPartySelectorOpen(false);
                        }}>
                        <Text
                          numberOfLines={2}
                          style={[
                            FONTS.fs_14_medium,
                            styles.partyOptionText,
                            isSelected && styles.partyOptionTextSelected,
                          ]}>
                          {template.partyTitle || '파티 이름 없음'}
                        </Text>
                        {isSelected ? (
                          <CheckIcon width={20} height={20} />
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default PartyReservation;
