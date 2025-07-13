import React, { useState } from 'react';
import axios from 'axios';

const token = localStorage.getItem('authToken');
const TOTAL_ROUNDS = 7;

const UploadsTab = () => {
  const testConnection = async () => {
    try {
      console.log('🧪 Testing basic connection...');

      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('No token found. Please log in first.');
        return;
      }

      const response = await axios.post(
        'http://localhost:5050/api/admin/test-upload',
        { test: 'data' },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('✅ Test connection successful:', response.data);
      alert('Connection test successful!');
    } catch (error) {
      alert('Connection test failed! Check console.');
    }
  };

  const [selectedFiles, setSelectedFiles] = useState<Record<number, File[]>>(
    {}
  );
  const [uploadingRound, setUploadingRound] = useState<number | null>(null);
  const [status, setStatus] = useState<Record<number, string>>({});

  const handleFileChange = (round: number, files: FileList | null) => {
    if (!files) return;
    setSelectedFiles((prev) => ({ ...prev, [round]: Array.from(files) }));
  };

  const handleUpload = async (round: number) => {
    const files = selectedFiles[round];
    if (!files || files.length === 0) {
      alert(`No files selected for round ${round}`);
      return;
    }

    console.log(`🚀 Starting upload for round ${round}`);
    console.log(
      `📁 Files to upload:`,
      files.map((f) => f.name)
    );

    try {
      setUploadingRound(round);
      setStatus((prev) => ({ ...prev, [round]: 'Uploading...' }));

      // Process each file individually since backend expects single file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📤 Uploading file ${i + 1}/${files.length}: ${file.name}`);

        const formData = new FormData();
        formData.append('csvFile', file);

        console.log(
          `🔗 Making request to: http://localhost:5050/api/admin/upload-match-data/${round}`
        );

        const response = await axios.post(
          `http://localhost:5050/api/admin/upload-match-data/${round}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(
          `✅ File ${file.name} uploaded successfully:`,
          response.data
        );
      }

      setStatus((prev) => ({
        ...prev,
        [round]: `✅ ${files.length} file(s) uploaded successfully!`,
      }));
    } catch (error) {
      console.error('❌ Upload error:', error);

      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
        console.error('Response headers:', error.response?.headers);
      }

      setStatus((prev) => ({
        ...prev,
        [round]: `❌ Upload failed:}`,
      }));
    } finally {
      setUploadingRound(null);
    }
  };

  return (
    <div className='p-6'>
      <h2 className='text-2xl font-semibold mb-4'>📂 Uploads</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <div className='mb-4'>
          <button
            onClick={testConnection}
            className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
          >
            🧪 Test Connection
          </button>
        </div>
        {[...Array(TOTAL_ROUNDS)].map((_, i) => {
          const round = i + 1;
          return (
            <div key={round} className='border rounded-xl p-4 shadow bg-white'>
              <h3 className='text-lg font-medium mb-2'>Round {round}</h3>
              <input
                type='file'
                accept='.csv'
                multiple
                onChange={(e) => handleFileChange(round, e.target.files)}
                className='mb-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
              />

              {selectedFiles[round] && selectedFiles[round].length > 0 && (
                <div className='mb-2 text-sm text-gray-600'>
                  Selected: {selectedFiles[round].map((f) => f.name).join(', ')}
                </div>
              )}

              <button
                onClick={() => handleUpload(round)}
                disabled={
                  uploadingRound === round ||
                  !selectedFiles[round] ||
                  selectedFiles[round].length === 0
                }
                className={`px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {uploadingRound === round ? 'Uploading...' : 'Upload CSV(s)'}
              </button>

              {status[round] && (
                <p className='mt-2 text-sm text-gray-700'>{status[round]}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UploadsTab;
