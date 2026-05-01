import api from './axiosInstance';

const hostDocumentApi = {
  getMyDocuments: applicationId => 
    api.get(`/host/my/documents/applications/${applicationId}`),

  getDocumentViewLink: (documentType, applicationId) =>
    api.get(`/host/my/documents/applications/${applicationId}/${documentType}/view-link`),

  downloadDocument: (documentType, applicationId) =>
    api.get(`/host/my/documents/applications/${applicationId}/${documentType}/download`, {
      responseType: 'arraybuffer',
    }),
};

export default hostDocumentApi;
