import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight
    );
}

function ImageCropper({ src, open, onClose, onSave }) {
    const [crop, setCrop] = useState(); 
    const [completedCrop, setCompletedCrop] = useState(null);
    const imgRef = useRef(null);

    function onImageLoad(e) {
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, 1));
    }

    const handleSave = () => {
        if (!completedCrop || !imgRef.current) return;
        
        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0, 0,
            completedCrop.width,
            completedCrop.height
        );
        
        canvas.toBlob(blob => {
            const previewUrl = URL.createObjectURL(blob);
            onSave(blob, previewUrl); 
        }, 'image/jpeg', 0.95);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Chỉnh sửa ảnh đại diện</DialogTitle>
            <DialogContent sx={{ display: 'flex', justifyContent: 'center' }}>
                {src && (
                    <ReactCrop
                        crop={crop}
                        onChange={c => setCrop(c)}
                        onComplete={c => setCompletedCrop(c)}
                        aspect={1}
                        circularCrop
                    >
                        <Box
                            component="img"
                            ref={imgRef}
                            alt="Crop preview"
                            src={src}
                            onLoad={onImageLoad} 
                            sx={{ maxHeight: '70vh', width: 'auto' }}
                        />
                    </ReactCrop>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button onClick={handleSave} variant="contained">OK</Button> 
            </DialogActions>
        </Dialog>
    );
}

export default ImageCropper;