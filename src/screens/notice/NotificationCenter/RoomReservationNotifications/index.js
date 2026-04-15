import React from 'react';
import NotificationList from '../NotificationList';

import {ROOM_RESERVATION_NOTIFICATIONS} from '../mockData';

const RoomReservationNotifications = () => {
  return <NotificationList items={ROOM_RESERVATION_NOTIFICATIONS} />;
};

export default RoomReservationNotifications;
