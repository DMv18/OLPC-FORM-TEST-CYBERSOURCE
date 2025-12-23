import { useHookNavigate } from '../../../hook/useHookNavigate';
import { Button } from '../../components/Button';

export default function Home() {
    const { handlerNavigate } = useHookNavigate();

    return (
        <div className='max-w-md mx-auto p-6'>
            <h1 className="text-2xl font-bold text-gray-800">Home Page</h1>

            <div className="mt-6 space-y-4">
                <Button type="button" onClick={() => handlerNavigate('/process-pay', false)}>
                    Pasarela de Pago
                </Button>
            </div>
        </div>
    );
}