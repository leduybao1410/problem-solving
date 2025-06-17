import { toast } from "sonner";

export const showToast = (type: 'success' | 'error', message: string, description: string) => {
    toast(message, {
        style: {
            backgroundColor: type === 'success' ? 'green' : 'red',
            color: 'white'
        },
        description
    });
};