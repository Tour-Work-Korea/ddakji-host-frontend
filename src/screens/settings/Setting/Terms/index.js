import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';

import Header from '@components/Header';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const Terms = () => {
  return (
    <View style={{flex: 1, backgroundColor: COLORS.grayscale_100}}>
      <Header title={'이용약관'} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{paddingVertical: 16}}>
        <View style={styles.menuContainer}>
          <Text style={styles.h2}>서비스 이용약관</Text>
          <Text style={styles.p}>게딱지 플랫폼 회원 약관</Text>

          <Text style={[styles.h2, {marginTop: 16}]}>제1장 (총칙)</Text>

          <Text style={styles.h3}>제1조 (목적)</Text>
          <Text style={styles.p}>
            본 약관은 게딱지 (이하 "회사") 가 운영하는 "서비스"를 이용함에 있어 "회사"와 회원간의 이용 조건 및 제반 절차, 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
          </Text>

          <Text style={styles.h3}>제2조 (용어의 정의)</Text>
          <Text style={styles.p}>이 약관에서 사용하는 정의는 다음과 같습니다.</Text>
          <Text style={styles.li}>
            1호 "서비스"라 함은 회사가 운영하는 사이트를 통하여 개인이 구직 등의 목적으로 등록하는 자료를 각 목적에 맞게 분류 가공, 집계하여 정보를 제공하는 서비스와 게스트하우스의 구직 공고 탐색 및 기타 정보 검색과 숙박의 예약, 기타 사이트에서 제공하는 모든 부대 서비스를 말합니다.
          </Text>
          <Text style={styles.li}>
            2호 "사이트"라 함은 회사가 서비스를 "회원"에게 제공하기 위하여 컴퓨터 등 정보통신설비를 이용하여 설정한 가상의 영업장 또는 회사가 운영하는 웹사이트, 모바일 웹, 어플리케이션 등의 서비스를 제공하는 모든 매체를 통칭하며, 통합된 하나의 회원 계정(아이디 및 비밀번호)을 이용하여 서비스를 제공받을 수 있는 아래의 사이트를 말합니다.
          </Text>
          <Text style={styles.li}>
            3호 "회원"이라 함은 "회사"가 제공하는 서비스를 이용하거나 이용하려는 자로, "회사"와 이용계약을 체결한자 또는 체결하려는 자를 포함하며 아이디와 비밀번호의 설정 등 회원가입 절차를 거쳐 회사의 서비스에 회원 등록을 완료한 "개인회원"을 말합니다.
          </Text>
          <Text style={styles.li}>
            4호 "아이디"이라 함은 회원가입시 회원의 식별과 서비스 이용을 위하여 회원이 선정하고 회사가 부여하는 문자와 숫자의 조합을 말합니다.
          </Text>
          <Text style={styles.li}>
            5호 "비밀번호"라 함은 위 제4항에 따라 회원이 회원가입시 아이디를 설정하면서 아이디를 부여 받은 자와 동일인임을 확인하고 "회원"의 권익을 보호하기 위하여 "회원"이 선정한 문자와 숫자의 조합을 의미합니다.
          </Text>
          <Text style={styles.li}>
            6호 "비회원"이라 함은 회원가입절차를 거치지 않고 "회사"가 제공하는 서비스를 이용하거나 하려는 자를 말합니다.
          </Text>
          <Text style={styles.li}>
            7호 "이용자"라 함은 회사의 서비스를 이용하는 자로서, "회원"과 "비회원"을 의미합니다.
          </Text>

          <Text style={styles.h3}>제3조 (약관의 명시와 효력)</Text>
          <Text style={styles.p}>
            ① 본 약관은 서비스를 이용하고자 하는 모든 이용자에게 그 효력이 발생하며, 이 약관에 동의하지 않거나 본 약관을 준수하지 않는 경우 회사가 운영하는 모든 서비스에 대한 접근 및 이용이 금지됩니다.
          </Text>
          <Text style={styles.p}>
            ② 이용자는 회사가 운영하는 서비스에 접근하여 서비스를 이용할 경우 본 약관 및 관련 운영정책을 확인하고 준수하여야 합니다.
          </Text>
          <Text style={styles.p}>
            ③ 회사는 이용자가 서비스 이용 시 약관을 확인할 수 있도록 본 약관과 상호, 영업소 소재지, 대표자 성명, 사업자등록번호, 연락처 등을 초기화면에 게시하거나 기타의 방법으로 이용자에게 공지하여야 합니다.
          </Text>
          <Text style={styles.p}>
            ④ 회사는 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.
          </Text>
          <Text style={styles.p}>
            ⑤ 회사가 약관을 변경할 시에, 적용일자와 변경 사유를 변경 약관의 적용일 7일 전부터 일까지 공지합니다. 단 회원에게 불리한 변경일 경우 적용일 30일 전부터 공지합니다.
          </Text>
          <Text style={styles.p}>
            ⑥ 회원은 변경된 약관에 대하여 거부할 수 있으며, 이 경우 서비스 이용계약을 해지할 수 있습니다. 명시적으로 거부하지 않고 계속 서비스를 이용하면 동의한 것으로 간주합니다.
          </Text>

          <Text style={styles.h3}>제4조 (약관의 해석)</Text>
          <Text style={styles.p}>
            ① 이 약관에서 규정하지 않은 사항에 관해서는 관계법령에 따릅니다.
          </Text>
          <Text style={styles.p}>
            ② 회사는 개별 서비스 또는 서비스 내 항목에 대하여 개별약관 또는 이용정책을 정할 수 있습니다. 상충할 경우 개별약관 또는 정책이 우선 적용됩니다.
          </Text>

          <Text style={[styles.h2, {marginTop: 16}]}>
            제2장 (이용계약의 성립 및 정보 보호)
          </Text>

          <Text style={styles.h3}>제5조 (이용계약의 성립)</Text>
          <Text style={styles.p}>
            ① 서비스 이용계약은 가입신청자가 가입을 신청하고 회사가 이를 승낙함으로써 성립합니다. 본 약관과 방침에 동의 버튼을 누른 경우 동의한 것으로 간주합니다.
          </Text>
          <Text style={styles.p}>
            ② 회사는 실명확인 및 본인인증을 요청할 수 있으며, 요구되는 정보를 제공해야 합니다.
          </Text>

          <Text style={styles.h3}>제6조 (가입 승낙과 제한)</Text>
          <Text style={styles.p}>
            ① 허위 기재, 타인 도용, 범죄 목적 등의 경우 가입 승낙을 거절할 수 있습니다.
          </Text>
          <Text style={styles.p}>
            ② 서비스 설비나 기술적 지장이 있을 경우 승낙을 유보할 수 있습니다.
          </Text>

          <Text style={styles.h3}>제7조 (회원정보의 관리 및 보호)</Text>
          <Text style={styles.p}>
            ① 계정의 관리책임은 전적으로 회원 본인에게 있으며, 타인에게 양도하거나 대여할 수 없습니다.
          </Text>
          <Text style={styles.p}>
            ② 개인정보의 수집 및 이용, 보호에 관한 사항은 회사의 개인정보처리방침을 적용합니다.
          </Text>

          <Text style={[styles.h2, {marginTop: 16}]}>제3장 (서비스의 운영)</Text>

          <Text style={styles.h3}>제9조 (콘텐츠 권리)</Text>
          <Text style={styles.p}>
            ① 회사가 제공하는 서비스에 대한 디자인, 로고, 소스 등의 지식재산권은 회사가 보유합니다.
          </Text>
          <Text style={styles.p}>
            ② 이용자는 회사의 사전 승낙 없이 무단으로 영리 목적으로 정보를 유출하거나 타인에게 배포할 수 없습니다.
          </Text>

          <Text style={styles.h3}>제10조 (계약 해지)</Text>
          <Text style={styles.p}>
            ① 회원은 언제든지 절차에 따라 서비스 해지를 요청할 수 있으며, 처리방침에 따라 신속하게 데이터를 삭제합니다.
          </Text>
          <Text style={styles.p}>
            ② 회원의 타당한 귀책사유로 인해 타인에게 피해를 입힌 경우 사전 알림 없이 일방적으로 제재 및 해지를 통보할 수 있습니다.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {paddingHorizontal: 20},
  menuContainer: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  h2: {
    ...FONTS.fs_16_semibold,
    color: COLORS.grayscale_800,
    marginBottom: 8,
  },
  h3: {
    ...FONTS.fs_14_semibold,
    color: COLORS.grayscale_800,
    marginTop: 12,
    marginBottom: 6,
  },
  p: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_700,
    lineHeight: 20,
    marginBottom: 6,
  },
  li: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_700,
    lineHeight: 20,
    marginLeft: 12,
    marginBottom: 4,
  },
});

export default Terms;
