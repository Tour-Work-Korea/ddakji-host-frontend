import api from './axiosInstance';

const hostDocumentApi = {
  getMyDocuments: () => api.get('/host/my/documents'),

  getDocumentViewLink: documentType =>
    api.get(`/host/my/documents/${documentType}/view-link`),

  downloadDocument: documentType =>
    api.get(`/host/my/documents/${documentType}/download`, {
      responseType: 'arraybuffer',
    }),
};

export default hostDocumentApi;
