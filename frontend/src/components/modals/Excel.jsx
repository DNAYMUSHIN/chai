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

    return (
        <React.Fragment>
            <Modal
                open={props.open}
                onClose={props.handleClose}
                aria-labelledby="child-modal-title"
                aria-describedby="child-modal-description"
            >
                <Box sx={{ ...style, width: "80vw"}} className="excel-popup">
                    <h2 id="child-modal-title" className="title">Выгрузка в Excel</h2>
                    <Button className="exit" onClick={props.handleClose}>Закрыть</Button>
                    <Button className="button-all" onClick={() => console.log("1")}>Все товары  (имеющиеся, законченные, отключенные и тд)</Button>
                    <Button className="button-need" onClick={() => console.log("2")}>Необходимый товар к следующей покупке</Button>
                    <Button className="button-have" onClick={() => console.log("3")}>Имеющийся товар</Button>
                </Box>
            </Modal>
        </React.Fragment>
    );
};

export default Excel;