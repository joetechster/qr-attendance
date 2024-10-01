import * as React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  PaletteMode,
  TextField,
  Typography,
} from "@mui/material";
import { createTheme } from "@mui/material/styles";
import getLPTheme from "../utils/getLPTheme";
import Layout from "./Layout";
import { getUser } from "../utils/auth";
import { useAlert } from "react-alert";

// To use Html5QrcodeScanner (more info below)
import { Html5QrcodeScanner } from "html5-qrcode";

// To use Html5Qrcode (more info below)
import { Html5Qrcode } from "html5-qrcode";
import { baseUrl, fetchAuth } from "../utils/globals";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
interface ToggleCustomThemeProps {
  showCustomTheme: Boolean;
  toggleCustomTheme: () => void;
}

export default function LandingPage() {
  const [mode, setMode] = React.useState<PaletteMode>("light");
  const LPtheme = createTheme(getLPTheme(mode));
  const { user } = getUser()!;

  const toggleColorMode = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <Layout mode={mode}>
      <Box minHeight="100dvh">
        <Header />
        <Box display="flex" justifyContent="center" alignItems="center">
          {user.type === "instructor" ? <InstructorHome /> : <StudentHome />}
        </Box>
      </Box>
    </Layout>
  );
}

const InstructorHome = () => {
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const startLecture = async (event: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const res = await fetchAuth("lecture/", { method: "POST", body: data }, true);
    if (res.status === 201 || res.status === 200) {
      const { id } = await res.json();
      navigate(`/lecture/${id}`);
    } else {
      console.log(await res.json());
    }
    setLoading(false);
  };

  return (
    <Box
      component="form"
      onSubmit={startLecture}
      noValidate
      sx={{
        position: "absolute",
        inset: 0,
        left: "50%",
        transform: "translate(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        alignItems: "center",
        justifyContent: "center",
        width: "min(100%, 600px)",
        p: 2,
      }}
    >
      <TextField required fullWidth name="name" label="Course Name" id="name" />
      <TextField required fullWidth name="code" label="Course Code" id="code" />
      <Button
        variant="contained"
        type="submit"
        disabled={loading} // Disable the button when loading
        startIcon={loading ? <CircularProgress size={20} color="secondary" /> : null}
      >
        Start a new Lecture
      </Button>
    </Box>
  );
};

const StudentHome = () => {
  const [scanning, setScanning] = React.useState<Boolean>(false);
  const alert = useAlert();
  const navigate = useNavigate();
  let html5QrcodeScannerRef = React.useRef<Html5QrcodeScanner>();
  React.useEffect(() => {
    html5QrcodeScannerRef.current = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );
  }, []);
  function onScanSuccess(fullHref, decodedResult) {
    html5QrcodeScannerRef.current?.pause();
    // handle the scanned code as you like, for example:
    alert.success("QR Code scanned successfully redirecting you to lecture");
    // Extract the relative path from the full URL
    const relativePath = new URL(fullHref).pathname;

    // Navigate using the relative path
    setTimeout(() => navigate(relativePath), 2000);

    console.log(`Code matched = ${fullHref}`, decodedResult);
  }

  function onScanFailure(error) {
    // handle scan failure, usually better to ignore and keep scanning.
    // for example:
  }

  const openScanner = () => {
    if (scanning) return;
    setScanning(true);
    html5QrcodeScannerRef.current?.render(onScanSuccess, onScanFailure);
  };

  return (
    <>
      <Box sx={{ width: "min(100%, 600px)" }}>
        <Box id="reader" width="100%" />
      </Box>
      {!scanning && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            left: "50%",
            transform: "translate(-50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "min(100%, 600px)",
          }}
        >
          <Button variant="contained" onClick={openScanner}>
            Scan QR Code
          </Button>
        </Box>
      )}
    </>
  );
};
