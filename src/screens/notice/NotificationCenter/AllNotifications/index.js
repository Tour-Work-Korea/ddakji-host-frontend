import React from 'react';
import NotificationList from '../NotificationList';

import {ALL_NOTIFICATIONS} from '../mockData';

const AllNotifications = () => {
  return <NotificationList items={ALL_NOTIFICATIONS} />;
};

export default AllNotifications;
