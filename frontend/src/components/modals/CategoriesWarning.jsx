import React from 'react';
import {Box, Button, Modal} from "@mui/material";
import "./CategoriesWarning.css"

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

const CategoriesWarning = ({ open, handleClose, onConfirm }) => {
    return (
        <React.Fragment>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="child-modal-title"
                aria-describedby="child-modal-description"
            >
                <Box sx={{ ...style, width: "80vw"}} className="categories-popup">
                    <h2 id="child-modal-title" className="title">Удаление категории</h2>
                    <Button className="exit" variant="outlined" onClick={handleClose}>Вернуться</Button>
                    <p className="categories-popup__warning">Вы уверены? Все товары данной категории будут перемещены в "Без категории"</p>
                    <Button className="button-all" variant="contained"  onClick={onConfirm}>Удалить</Button>
                </Box>
            </Modal>
        </React.Fragment>
    );
};

export default CategoriesWarning;