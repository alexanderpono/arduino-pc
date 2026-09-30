import { Serializable, jsonProperty } from 'ts-serializable';
// import { WsEvent } from '@config/WsEvent';

export class WsMessage extends Serializable {
    @jsonProperty(String)
    public event = '';
}
export const defaultWsMessage = new WsMessage().fromJSON({});
