export const isEndedDateEvent = party => {
  if (party?.scheduleType !== 'DATE_EVENT') {
    return false;
  }
  if (party?.eventStatus === 'ENDED') {
    return true;
  }
  if (party?.eventStatus === 'ACTIVE') {
    return false;
  }

  const dateKey = String(party?.eventDate ?? '').split('T')[0];
  const endTime = party?.partyEndTime;
  if (!dateKey || !endTime) {
    return false;
  }

  const endDateTime = new Date(`${dateKey}T${endTime}`);
  return !Number.isNaN(endDateTime.getTime()) && endDateTime <= new Date();
};

export const getManageablePartyTemplates = templates =>
  templates
    .filter(
      template =>
        (template?.isApplyOpen ?? template?.isApply) === true ||
        isEndedDateEvent(template),
    )
    .sort(
      (first, second) =>
        Number(isEndedDateEvent(first)) - Number(isEndedDateEvent(second)),
    );
