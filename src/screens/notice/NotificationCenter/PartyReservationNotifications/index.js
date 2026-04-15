import React from 'react';
import NotificationList from '../NotificationList';

import {PARTY_RESERVATION_NOTIFICATIONS} from '../mockData';

const PartyReservationNotifications = () => {
  return <NotificationList items={PARTY_RESERVATION_NOTIFICATIONS} />;
};

export default PartyReservationNotifications;
