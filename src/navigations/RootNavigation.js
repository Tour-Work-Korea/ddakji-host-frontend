import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from '@utils/navigationService';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import useUserStore from '@stores/userStore';
import useGuesthouseMetaStore from '@stores/guesthouseMetaStore';

import undefinedStack from './undefinedStack';

import MainStack from '@screens/app/MainStack';

import {
  EmployDetail,
  ResumeDetail,
  AgreeDetail,
  StoreRegisterList,
  Login,
  RegisterIntro,
  RegisterAgree,
  PhoneCertificate,
  EmailCertificate,
  HostRegisterInfo,
  Result,
  MyGuesthouseAdd,
  MyGuesthouseEdit,
  MyGuesthousePreview,
  MyRecruitmentList,
  RecruitmentForm,
  HostEditInfo,
  HostAgreementStatus,
  HostDocumentViewer,
  ApplicantList,
  ApplicantListByRecruit,
  Setting,
  NotificationSettings,
  NotificationCenter,
  SettlementManagement,
  SettlementAccountChange,
  SettlementDetail,
  SalesManagement,
  SalesReservationMetricList,
  Terms,
  MyGuesthouseList,
  MyGuesthouseReview,
  MyGuesthouseReservation,
  MyGuesthouseReservationDetail,
  MyRoomDetail,
  StoreRegisterForm1,
  StoreRegisterForm2,
  StoreRegisterEditForm,
  StoreRegisterComplete,
  GuesthouseManagement,
  ReservationMethodSettings,
  MyMeetList,
  MyMeetDetail,
  MyMeetAdd,
  ReservationCancelList,
  PastReservationList,
  FindPassword,
  VerifyPhone,
  FindIntro,
  GuesthousePost,
  MyGuesthouseIntroList,
  MyGuesthouseIntroForm,
  MyGuesthouseReservationCalendar,
  MyRoomManage,
  CustomerNotificationSettings,
  CheckInGuide,
  RoomGuideMessageEditor,
  HostProfilePage,
  HostEditProfile,
  NoticeList,
  NoticeDetail,
} from '@screens';

const Stack = createNativeStackNavigator();

const RootNavigation = () => {
  const accessToken = useUserStore(state => state.accessToken);
  const userRole = useUserStore(state => state.userRole);
  const setGuesthouseMeta = useGuesthouseMetaStore(
    state => state.setGuesthouseMeta,
  );

  useEffect(() => {
    if (!accessToken || userRole !== 'HOST') {
      return;
    }

    let isMounted = true;

    const loadGuesthouseMeta = async () => {
      try {
        const [hashtagsResponse, amenitiesResponse] = await Promise.all([
          hostGuesthouseApi.getGuesthouseHashtags(),
          hostGuesthouseApi.getGuesthouseAmenities(),
        ]);

        if (!isMounted) {
          return;
        }

        setGuesthouseMeta({
          hashtags: hashtagsResponse?.data,
          amenities: amenitiesResponse?.data,
        });
      } catch (error) {
        console.warn('게스트하우스 메타데이터 로드 실패:', error);
      }
    };

    loadGuesthouseMeta();

    return () => {
      isMounted = false;
    };
  }, [accessToken, setGuesthouseMeta, userRole]);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainStack} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="undefined" component={undefinedStack} />
        <Stack.Screen name="Setting" component={Setting} />
        <Stack.Screen
          name="NotificationSettings"
          component={NotificationSettings}
        />
        <Stack.Screen
          name="NotificationCenter"
          component={NotificationCenter}
        />
        <Stack.Screen name="SettlementManagement" component={SettlementManagement} />
        <Stack.Screen name="SettlementAccountChange" component={SettlementAccountChange} />
        <Stack.Screen name="SettlementDetail" component={SettlementDetail} />
        <Stack.Screen name="SalesManagement" component={SalesManagement} />
        <Stack.Screen name="SalesReservationMetricList" component={SalesReservationMetricList} />
        <Stack.Screen name="Terms" component={Terms} />
        <Stack.Screen name="NoticeList" component={NoticeList} />
        <Stack.Screen name="NoticeDetail" component={NoticeDetail} />
        <Stack.Screen name="StoreRegisterList" component={StoreRegisterList} />
        {/* 공고 하단바 없는 화면 */}
        <Stack.Screen name="EmployDetail" component={EmployDetail} />
        <Stack.Screen name="ResumeDetail" component={ResumeDetail} />
        <Stack.Screen name="AgreeDetail" component={AgreeDetail} />
        {/* 로그인, 회원가입 하단바 없는 화면 */}
        <Stack.Screen name="RegisterIntro" component={RegisterIntro} />
        <Stack.Screen name="RegisterAgree" component={RegisterAgree} />
        <Stack.Screen name="PhoneCertificate" component={PhoneCertificate} />
        <Stack.Screen name="EmailCertificate" component={EmailCertificate} />
        <Stack.Screen name="HostRegisterInfo" component={HostRegisterInfo} />
        <Stack.Screen name="Result" component={Result} />
        <Stack.Screen name="FindIntro" component={FindIntro} />
        <Stack.Screen name="VerifyPhone" component={VerifyPhone} />
        <Stack.Screen name="FindPassword" component={FindPassword} />
        {/* 사장님 마이페이지 하단바 없는 화면 */}
        <Stack.Screen name="HostEditInfo" component={HostEditInfo} />
        <Stack.Screen
          name="HostAgreementStatus"
          component={HostAgreementStatus}
        />
        <Stack.Screen
          name="HostDocumentViewer"
          component={HostDocumentViewer}
        />
        <Stack.Screen name="HostEditProfile" component={HostEditProfile} />
        <Stack.Screen name="StoreRegisterForm1" component={StoreRegisterForm1} />
        <Stack.Screen name="StoreRegisterForm2" component={StoreRegisterForm2} />
        <Stack.Screen
          name="StoreRegisterEditForm"
          component={StoreRegisterEditForm}
        />
        <Stack.Screen
          name="StoreRegisterComplete"
          component={StoreRegisterComplete}
        />
        <Stack.Screen
          name="GuesthouseManagement"
          component={GuesthouseManagement}
        />
        <Stack.Screen
          name="ReservationMethodSettings"
          component={ReservationMethodSettings}
        />
        <Stack.Screen name="MyGuesthouseList" component={MyGuesthouseList} />
        <Stack.Screen name="MyGuesthouseAdd" component={MyGuesthouseAdd} />
        <Stack.Screen name="MyGuesthouseEdit" component={MyGuesthouseEdit} />
        <Stack.Screen name="MyGuesthousePreview" component={MyGuesthousePreview} />
        <Stack.Screen name="MyRoomDetail" component={MyRoomDetail} />
        <Stack.Screen name="MyGuesthouseReview" component={MyGuesthouseReview} />
        <Stack.Screen name="MyGuesthouseReservation" component={MyGuesthouseReservation} />
        <Stack.Screen name="MyGuesthouseReservationDetail" component={MyGuesthouseReservationDetail} />
        <Stack.Screen name="MyGuesthouseReservationCalendar" component={MyGuesthouseReservationCalendar} />
        <Stack.Screen name="CustomerNotificationSettings" component={CustomerNotificationSettings} />
        <Stack.Screen name="CheckInGuide" component={CheckInGuide} />
        <Stack.Screen name="RoomGuideMessageEditor" component={RoomGuideMessageEditor} />
        <Stack.Screen
          name="MyRoomManage"
          component={MyRoomManage}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="MyRecruitmentList" component={MyRecruitmentList} />
        <Stack.Screen name="RecruitmentForm" component={RecruitmentForm} />
        <Stack.Screen name="ApplicantList" component={ApplicantList} />
        <Stack.Screen
          name="ApplicantListByRecruit"
          component={ApplicantListByRecruit}
        />
        <Stack.Screen name="MyMeetList" component={MyMeetList} />
        <Stack.Screen name="MyMeetDetail" component={MyMeetDetail} />
        <Stack.Screen name="MyMeetAdd" component={MyMeetAdd} />
        <Stack.Screen
          name="ReservationCancelList"
          component={ReservationCancelList}
        />
        <Stack.Screen
          name="PastReservationList"
          component={PastReservationList}
        />
        <Stack.Screen name="HostProfilePage" component={HostProfilePage} />

        {/* 이벤트화면 */}
        {/* 게하 포스트 화면 */}
        <Stack.Screen name="GuesthousePost" component={GuesthousePost} />
        <Stack.Screen
          name="MyGuesthouseIntroList"
          component={MyGuesthouseIntroList}
        />
        <Stack.Screen
          name="MyGuesthouseIntroForm"
          component={MyGuesthouseIntroForm}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigation;
