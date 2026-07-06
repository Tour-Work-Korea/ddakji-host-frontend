import api from './axiosInstance';

const userEmployApi = {
  getRecruitById: recruitId => api.get(`/user/recruits/${recruitId}`),

  getRecruitComments: (recruitId, params) =>
    api.get(`/user/recruits/${recruitId}/comments`, {params}),

  getRecruitCommentReplies: commentId =>
    api.get(`/user/recruits/comments/${commentId}/replies`),
};

export default userEmployApi;
