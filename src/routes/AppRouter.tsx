import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

const Home = lazy(() => import("../pages/views/Home/Home"));
const ProcessPayView = lazy(() => import("../pages/views/Pays/ProcessPayView"));

export function AppRouter() {
    return(
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />

                <Route path="/process-pay" element={<ProcessPayView />} />
            </Routes>
        </Suspense>
    );
}