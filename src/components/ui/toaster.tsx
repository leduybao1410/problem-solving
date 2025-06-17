import { Toaster } from "sonner";

export function MyToaster({ duration = 3000 }: { duration?: number }) {
    return (<Toaster
        position='top-center'
        duration={duration}
        toastOptions={{
            descriptionClassName: '!text-white !text-sm',
            style: {
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '16px',
                fontWeight: 500,
            },
        }}
    />)
}