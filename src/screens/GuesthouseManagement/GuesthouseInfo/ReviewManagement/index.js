import React from 'react';
import {View} from 'react-native';

import MyGuesthouseReviewList from '@screens/guesthouse/MyGuesthouseReview/MyGuesthouseReviewList';
import styles from './ReviewManagement.styles';

const ReviewManagement = ({guesthouseId}) => {
  if (!guesthouseId) {
    return null;
  }

  return (
    <View style={styles.container}>
      <MyGuesthouseReviewList guesthouseId={guesthouseId} key={guesthouseId} />
    </View>
  );
};

export default ReviewManagement;
