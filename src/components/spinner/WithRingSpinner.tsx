import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

const WithRingSpinner = ({ loading = false }) => {
  return (
    <Backdrop
      open={loading}
      sx={{
        color: "#8BB236",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        zIndex: (theme) => theme.zIndex.modal + 1,
      }}
    >
      <CircularProgress
        size={80}
        thickness={3}
        sx={{ color: "#8BB236" }}
      />
    </Backdrop>
  );
};

export { WithRingSpinner };
