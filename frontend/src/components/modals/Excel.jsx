import React from 'react';
import {Box, Button, Modal} from "@mui/material";
import "./Excel.css"

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: '2rem',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
};

const Excel = (props) => {
    const handleDownload = async (status) => {
        try {
            const response = await fetch('/api/reportProduct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // если используется авторизация
                },
                body: JSON.stringify({status})
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Создаем blob из ответа
            const blob = await response.blob();

            // Создаем ссылку для скачивания
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'report.xlsx';
            document.body.appendChild(a);
            a.click();

            // Очищаем
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error) {
            console.error('Error downloading file:', error);
            alert('Ошибка скачивания файла: ' + error);
        }
    };

    return (
        <React.Fragment>
            <Modal
                open={props.open}
                onClose={props.handleClose}
                aria-labelledby="child-modal-title"
                aria-describedby="child-modal-description"
            >
                <Box sx={{...style, width: "80vw"}} className="excel-popup">
                    <h2 id="child-modal-title" className="title">Выгрузка в Excel</h2>
                    <Button className="exit" variant="outlined" onClick={props.handleClose}>Закрыть</Button>
                    <Button className="button-all" variant="contained" onClick={() => handleDownload('all')}>Все товары
                        (имеющиеся, законченные, отключенные и тд)</Button>
                    <Button className="button-need" variant="contained" onClick={() => handleDownload('need')}>Необходимый
                        товар к следующей покупке</Button>
                    <Button className="button-have" variant="contained" onClick={() => handleDownload('have')}>Имеющийся
                        товар</Button>
                </Box>
            </Modal>
        </React.Fragment>
    );
};

export default Excel;