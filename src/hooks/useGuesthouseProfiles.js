import { useState, useCallback, useMemo, useEffect } from 'react';
import notificationApi from '@utils/api/notificationApi';
import useUserStore from '@stores/userStore';

export const useGuesthouseProfiles = () => {
  const hostProfile = useUserStore(state => state.hostProfile);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await notificationApi.getMyNotifications();
      const content = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];
      setNotifications(content);
    } catch (error) {
      console.warn('Failed to fetch notifications for noticeCount', error?.message);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const guesthouseProfiles = useMemo(() => {
    if (!Array.isArray(hostProfile?.guesthouseProfiles)) return [];

    return hostProfile.guesthouseProfiles
      .filter(
        item =>
          item?.applicationStatus === '승인 완료' ||
          item?.applicationStatus === 'APPROVED' ||
          item?.status === '승인 완료' ||
          item?.status === 'APPROVED'
      )
      .map((item, index) => {
        const ghId = String(item?.guesthouseId ?? item?.profileKey ?? `guesthouse-${index}`);
        const count = notifications.filter(
          n => !n.isRead && String(n.guesthouseId) === ghId
        ).length;

        return {
          id: ghId,
          guesthouseId: item?.guesthouseId ?? null,
          name: item?.guesthouseName || '이름 없음',
          photoUrl: item?.profileImageUrl || null,
          noticeCount: count,
        };
      });
  }, [hostProfile?.guesthouseProfiles, notifications]);

  return { guesthouseProfiles, fetchNotifications };
};
