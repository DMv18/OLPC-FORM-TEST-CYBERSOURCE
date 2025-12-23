import { useHookNavigate } from '../../../hook/useHookNavigate';
import { Button } from '../../components/Button';

export default function Home() {
    const { handlerNavigate } = useHookNavigate();

    return (
        <div>
            <h1>Welcome to the Home Page</h1>
            
            <Button type="button" onClick={() => handlerNavigate('/process-pay', false)}>
                Pasarela de Pago
            </Button>
        </div>
    );
}