export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  groqApiKey: process.env.GROQ_API_KEY,
  maxUploadFiles: parseInt(process.env.MAX_UPLOAD_FILES, 10) || 10,
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 5,
});
