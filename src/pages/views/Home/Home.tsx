import { useHookNavigate } from '../../../hook/useHookNavigate';

export default function Home(){
    const { handlerNavigate } = useHookNavigate();

    return(
        <div>
            <h1>Welcome to the Home Page</h1>
            <button onClick={() => handlerNavigate('/process-pay', false)}>Pasarela de Pago</button>
        </div>
    );
}