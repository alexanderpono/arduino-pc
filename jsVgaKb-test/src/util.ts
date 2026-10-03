const addZeros = (val: number): string => `${val < 1 ? '00' : val < 10 ? '0' + val : val}`;

export const toMMSS = (sec: number) => {
    const mm = Math.floor(sec / 60);
    const ss = sec % 60;
    return `${addZeros(mm)}:${addZeros(ss)}`;
};
