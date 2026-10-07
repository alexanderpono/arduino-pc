import { ResetApi } from './Reset.service';
import { RgbApi } from './Rgb.service';

export const apiProvider = () => ({
    reset: () => new ResetApi(),
    rgb: () => new RgbApi()
});
