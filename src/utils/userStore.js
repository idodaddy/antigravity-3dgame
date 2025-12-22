import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'playmini_user_id';
const NICKNAME_KEY = 'playmini_user_nickname';

export const getUserID = () => {
    let uuid = localStorage.getItem(STORAGE_KEY);
    if (!uuid) {
        uuid = uuidv4();
        localStorage.setItem(STORAGE_KEY, uuid);
    }
    return uuid;
};

export const getUserNickname = () => {
    return localStorage.getItem(NICKNAME_KEY) || `Player_${getUserID().slice(0, 4)}`;
};

export const setNickname = (nickname) => {
    localStorage.setItem(NICKNAME_KEY, nickname);
};
