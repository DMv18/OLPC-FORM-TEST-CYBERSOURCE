import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

import { WithRingSpinner } from "../components/spinner/WithRingSpinner";

const Home = lazy(() => import("../pages/views/Home/Home"));
const ProcessPayView = lazy(() => import("../pages/views/Pays/ProcessPayView"));

export function AppRouter() {
    return(
        <Suspense fallback={<WithRingSpinner />}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/*" element={<Home />} />
                <Route path="/home" element={<Home />} />

                <Route path="/process-pay" element={<ProcessPayView />} />
            </Routes>
        </Suspense>
    );
}