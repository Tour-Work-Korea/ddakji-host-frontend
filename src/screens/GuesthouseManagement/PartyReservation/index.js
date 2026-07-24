import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';
import hostMeetApi from '@utils/api/hostMeetApi';
import CheckIcon from '@assets/images/check_orange.svg';
import ChevronRightIcon from '@assets/images/chevron_right_orange.svg';
import ReservationCheck from './ReservationCheck';
import Settings from './Settings';
import styles from './PartyReservation.styles';

const chips = ['신청 관리', '설정'];

const PartyReservation = ({ guesthouseId }) => {
  const [activeChip, setActiveChip] = useState(chips[0]);
  const [partyTemplates, setPartyTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [isTemplateLoading, setIsTemplateLoading] = useState(true);
  const [isPartySelectorOpen, setIsPartySelectorOpen] = useState(false);

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

        let preferredTemplateId = null;
        try {
          const settingsResponse = await hostMeetApi.getPartySettings(guesthouseId);
          preferredTemplateId = settingsResponse?.data?.templateId ?? null;
        } catch (error) {
          preferredTemplateId = null;
        }

        if (!isMounted) {
          return;
        }

        setPartyTemplates(templates);
        setSelectedTemplateId(prev => {
          const previousExists = templates.some(
            template => String(template.templateId) === String(prev),
          );
          if (previousExists) {
            return prev;
          }

          const preferredExists = templates.some(
            template =>
              String(template.templateId) === String(preferredTemplateId),
          );
          return preferredExists
            ? preferredTemplateId
            : templates[0]?.templateId ?? null;
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
  }, [guesthouseId]);

  const selectedTemplate = partyTemplates.find(
    template => String(template.templateId) === String(selectedTemplateId),
  );

  return (
    <View style={styles.container}>
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

      {partyTemplates.length > 1 ? (
        <View style={styles.partySelector}>
          <View style={styles.partySelectorHeader}>
            <Text style={[FONTS.fs_12_medium, styles.partySelectorLabel]}>
              현재 관리 중인 파티
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.partyManagementCard}
            onPress={() => setIsPartySelectorOpen(true)}>
            <View style={styles.partyManagementContent}>
              <Text
                numberOfLines={2}
                style={[FONTS.fs_16_semibold, styles.selectedPartyTitle]}>
                {selectedTemplate?.partyTitle || '파티를 선택해주세요'}
              </Text>
              <Text style={[FONTS.fs_12_medium, styles.partyManagementHint]}>
                신청 현황과 설정이 이 파티를 기준으로 표시돼요
              </Text>
            </View>
            <View style={styles.changePartyButton}>
              <Text style={[FONTS.fs_12_medium, styles.changePartyText]}>
                변경
              </Text>
              <ChevronRightIcon width={14} height={14} />
            </View>
          </TouchableOpacity>
        </View>
      ) : null}

      {isTemplateLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary_orange} />
        </View>
      ) : activeChip === chips[0] ? (
        <ReservationCheck
          key={`reservation-${selectedTemplateId ?? 'default'}`}
          guesthouseId={guesthouseId}
          templateId={selectedTemplateId}
        />
      ) : (
        <Settings
          key={`settings-${selectedTemplateId ?? 'default'}`}
          guesthouseId={guesthouseId}
          selectedTemplateId={selectedTemplateId}
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
                      String(template.templateId) === String(selectedTemplateId);

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
                        {isSelected ? <CheckIcon width={20} height={20} /> : null}
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
