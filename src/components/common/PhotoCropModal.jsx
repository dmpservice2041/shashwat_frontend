import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import Modal from './Modal';
import { ZoomIn, ZoomOut, Save, RefreshCw } from 'lucide-react';
import styles from './PhotoCropModal.module.css';

const PhotoCropModal = ({ isOpen, onClose, image, onCropComplete }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropChange = useCallback((crop) => setCrop(crop), []);
    const onZoomChange = useCallback((zoom) => setZoom(zoom), []);

    const onCropCompleteInternal = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        try {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels);
            onCropComplete(croppedImage);
            onClose();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Adjust Profile Photo" maxWidth="600px">
            <div className={styles.cropperContainer}>
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={onCropChange}
                    onCropComplete={onCropCompleteInternal}
                    onZoomChange={onZoomChange}
                />
            </div>

            <div className={styles.controls}>
                <div className={styles.zoomControl}>
                    <ZoomOut size={18} className={styles.zoomIcon} />
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className={styles.slider}
                    />
                    <ZoomIn size={18} className={styles.zoomIcon} />
                </div>

                <div className={styles.actions}>
                    <button className={styles.cancelBtn} onClick={onClose}>
                        Cancel
                    </button>
                    <button className={styles.saveBtn} onClick={handleSave}>
                        <Save size={18} />
                        Apply Crop
                    </button>
                </div>
            </div>
        </Modal>
    );
};

// Helper function to generate cropped image
async function getCroppedImg(imageSrc, pixelCrop) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/jpeg');
    });
}

const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });

export default PhotoCropModal;
