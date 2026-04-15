import React from 'react';
import NotificationList from '../NotificationList';

import {NOTICE_NOTIFICATIONS} from '../mockData';

const NoticeNotifications = () => {
  return <NotificationList items={NOTICE_NOTIFICATIONS} />;
};

export default NoticeNotifications;
