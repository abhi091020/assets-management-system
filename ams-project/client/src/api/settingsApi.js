// client/src/api/settingsApi.js
import axiosInstance from "./axiosInstance";

export const getMeApi = () =>
  axiosInstance.get("/users/me").then((r) => r.data);

/**
 * updateMeApi
 * Sends as multipart/form-data so the server's multer middleware
 * can receive the optional photo file.
 *
 * @param {object} params
 * @param {string}      params.fullName
 * @param {string}      [params.phone]
 * @param {File|null}   [params.photoFile]   — raw File object from <input type="file">
 * @param {boolean}     [params.removePhoto] — true to explicitly clear the photo
 */
export const updateMeApi = ({ fullName, phone, photoFile, removePhoto }) => {
  const form = new FormData();
  form.append("fullName", fullName);
  if (phone) form.append("phone", phone);
  if (photoFile) form.append("photo", photoFile); // matches multer field name
  if (removePhoto) form.append("remove_photo", "true");

  return axiosInstance
    .put("/users/me", form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};

export const changeMyPasswordApi = (body) =>
  axiosInstance.put("/users/me/password", body).then((r) => r.data);
