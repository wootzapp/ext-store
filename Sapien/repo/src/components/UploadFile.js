import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardAPI } from '../services/api';
import '../styles/UploadFile.css';

const UploadFile = () => {
    console.log('Rendering UploadFile component');
    const navigate = useNavigate();
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = () => {
        console.log('File selection button clicked');
        try {
            if (fileInputRef.current) {
                fileInputRef.current.click();
                console.log('inside try');
            }
        } catch (error) {
            console.error('Error triggering file input click:', error);
            setUploadError('Failed to open file selector. Please try again.');
        }
    };

    const handleFileChange = (event) => {
        console.log('File input change detected');
        const file = event.target.files?.[0];
        
        if (file && file.type.startsWith('image/')) {
            console.log("File selected:", {
                name: file.name,
                type: file.type,
                size: file.size
            });
            
            // Create a blob URL for preview
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setSelectedFile(file);
            setUploadError(null);

            // Process the image if needed
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = e.target.result;
                console.log('Image loaded:', imageData.substring(0, 50) + '...');
            };
            reader.readAsDataURL(file);
            
            event.target.value = '';
            console.log('File input cleared');
        }
    };

    const handleSubmit = async () => {
        console.log('Submit button clicked', {
            hasFile: !!selectedFile,
            isConfirmed,
        });

        if (!selectedFile || !isConfirmed) {
            console.warn('Submission blocked: missing file or confirmation');
            setUploadError("Please select a file and confirm the instructions");
            return;
        }

        setUploading(true);
        console.log("Starting upload process...");

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);
            console.log('FormData created with file:', {
                fileName: selectedFile.name,
                fileType: selectedFile.type,
                fileSize: selectedFile.size
            });

            console.log('Sending upload request to API');
            const result = await DashboardAPI.uploadImage(formData);
            console.log("Upload API response:", result);
            
            if (result && result.success) {
                console.log('Upload successful, cleaning up...');
                alert('Image uploaded successfully!');
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                    console.log('Blob URL revoked');
                }
                setSelectedFile(null);
                setPreviewUrl('');
                setIsConfirmed(false);
                console.log('State reset complete');
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error("Upload error:", error);
            setUploadError(error.message || "Upload failed. Please try again.");
        } finally {
            console.log('Upload process completed');
            setUploading(false);
        }
    };

    React.useEffect(() => {
        return () => {
            if (previewUrl) {
                console.log('Component unmounting, cleaning up blob URL');
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleConfirmationChange = (e) => {
        console.log('Confirmation checkbox changed:', e.target.checked);
        setIsConfirmed(e.target.checked);
    };

    console.log('Rendering component with state:', {
        isConfirmed,
        hasSelectedFile: !!selectedFile,
        hasPreview: !!previewUrl,
        uploading,
        uploadError
    });

    return (
        <div className="upload-container">
            <div className="content-container">
                <button 
                    className="instructions-button"
                    onClick={() => {
                        console.log('Instructions button clicked');
                        navigate('/instructions');
                    }}
                >
                    See Instructions Again
                </button>

                {/* Added link with redirect functionality */}
                <div style={{ margin: '10px 0', textAlign: 'center' }}>
                    <a
                        href="https://pnj2jpg.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                            e.preventDefault(); // Prevent default anchor behavior
                            window.location.href = 'https://png2jpg.com'; // Direct redirect
                        }}
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        pnj2jpg.com
                    </a>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    capture="environment"
                />

                <div 
                    className="upload-area" 
                    onClick={handleFileSelect}
                    style={{ cursor: 'pointer' }}
                >
                    {previewUrl ? (
                        <div className="preview-container">
                            <img 
                                src={previewUrl} 
                                alt="Preview" 
                                className="image-preview"
                                style={{ maxWidth: '100%', maxHeight: '200px' }}
                            />
                            <div className="file-name">
                                {selectedFile?.name || 'Selected Image'}
                            </div>
                        </div>
                    ) : (
                        <div className="upload-placeholder">
                            <div className="upload-icon">⬆️</div>
                            <div className="upload-text">
                                Tap to Select a Photo
                            </div>
                        </div>
                    )}
                </div>

                {uploadError && (
                    <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>
                        {uploadError}
                    </div>
                )}

                <div className="confirmation-container">
                    <input
                        type="checkbox"
                        id="confirm-checkbox"
                        checked={isConfirmed}
                        onChange={handleConfirmationChange}
                    />
                    <label htmlFor="confirm-checkbox">
                        I confirm my submission adheres to the instructions
                    </label>
                </div>

                <button 
                    className={`submit-button ${(!isConfirmed || !selectedFile || uploading) ? 'disabled' : ''}`}
                    disabled={!isConfirmed || !selectedFile || uploading}
                    onClick={handleSubmit}
                    style={{
                        backgroundColor: (!isConfirmed || !selectedFile || uploading) ? '#ccc' : '#007bff',
                        cursor: (!isConfirmed || !selectedFile || uploading) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {uploading ? 'Uploading...' : 'Submit'}
                </button>
            </div>
        </div>
    );
};

export default UploadFile;