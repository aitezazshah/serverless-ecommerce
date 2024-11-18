import { useCallback, useState } from "react";
import {
  Button,
  TextField,
  Paper,
  Typography,
  Box,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup/src/yup.js";
import { Amplify } from "aws-amplify";
import {
  signUp,
  signIn,
  confirmSignUp,
  getCurrentUser,
  fetchUserAttributes,
  resendSignUpCode,
  updateUserAttributes,
  signOut,
} from "aws-amplify/auth";

// Configure Amplify
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_tdVO1Ghz3",
      userPoolClientId: "10fqms5r41oqvidv1jp0r2gkpt",
    },
  },
});

// Rest of your initial values and schema remain the same
const signupInitialValue = {
  username: "",
  email: "",
  password: "",
  userRole: "seller",
};

const loginInitialValue = {
  email: "",
  password: "",
  userRole: "seller",
};

function generateSchema(isSignUp: boolean) {
  return Yup.object().shape({
    ...(isSignUp && {
      username: Yup.string().required("Username is required"),
    }),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    userRole: Yup.string().required("User role is required"),
  });
}

export const Login = () => {
  const navigation = useNavigate();
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [verificationRequired, setVerificationRequired] =
    useState<boolean>(false);
  const [verificationEmail, setVerificationEmail] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<any>({
    defaultValues: isSignUp ? signupInitialValue : loginInitialValue,
    mode: "all",
    resolver: yupResolver(generateSchema(isSignUp)),
  });

  const handleLogin = useCallback(async () => {
    try {
      // Check if user is already signed in
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          const attributes = await fetchUserAttributes();

          // Verify user role
          if (attributes["custom:role"] !== watch("userRole")) {
            await signOut();
            setError("Invalid user role for login");
            return;
          }

          // User is already signed in with correct role
          localStorage.setItem("userRole", watch("userRole"));
          navigation("/dashboard");
          return;
        }
      } catch (error) {
        // Not signed in, continue with login
      }

      // Regular login flow
      const { isSignedIn } = await signIn({
        username: watch("email"),
        password: watch("password"),
      });

      if (isSignedIn) {
        const attributes = await fetchUserAttributes();

        // Verify user role
        if (attributes["custom:role"] !== watch("userRole")) {
          await signOut();
          setError("Invalid user role for login");
          return;
        }

        // Store necessary information
        localStorage.setItem("userRole", watch("userRole"));
        reset();
        navigation("/dashboard");
        setError("");
      }
    } catch (error: any) {
      if (error.name === "UserNotConfirmedException") {
        setVerificationRequired(true);
        setVerificationEmail(watch("email"));
        setError("Please verify your email first");
      } else {
        setError(error.message || "Login failed");
      }
    }
  }, [watch, reset, navigation]);

  const handleSignUp = useCallback(async () => {
    try {
      const { isSignUpComplete } = await signUp({
        username: watch("email"),
        password: watch("password"),
        options: {
          userAttributes: {
            email: watch("email"),
            name: watch("username"),
          },
          autoSignIn: true, // enables auto sign-in after verification
        },
      });

      if (!isSignUpComplete) {
        setVerificationRequired(true);
        setVerificationEmail(watch("email"));
        setError("");
      }
    } catch (error: any) {
      setError(error.message || "Signup failed");
    }
  }, [watch]);

  // After successful verification, update the user attributes
  const handleVerification = async () => {
    try {
      const { isSignUpComplete } = await confirmSignUp({
        username: verificationEmail,
        confirmationCode: verificationCode,
      });

      if (isSignUpComplete) {
        try {
          // Auto sign-in after verification
          const { isSignedIn } = await signIn({
            username: verificationEmail,
            password: watch("password"),
          });

          if (isSignedIn) {
            // Update user attributes with role
            await updateUserAttributes({
              userAttributes: {
                "custom:role": watch("userRole"),
              },
            });

            // Store role in localStorage
            localStorage.setItem("userRole", watch("userRole"));

            // Navigate to dashboard directly
            reset();
            navigation("/dashboard");
            return; // Exit the function here
          }
        } catch (error) {
          console.error("Error during auto sign-in:", error);
          setError(
            "Verification successful but login failed. Please try logging in manually."
          );
        }
      }

      // Only reach here if auto sign-in fails
      setVerificationRequired(false);
      setIsSignUp(false);
      setError("Email verified successfully. Please login.");
      reset();
    } catch (error: any) {
      setError(error.message || "Verification failed");
    }
  };

  const handleResendVerificationCode = async () => {
    try {
      await resendSignUpCode({
        username: verificationEmail,
      });
      setError("Verification code resent to your email");
    } catch (error: any) {
      setError(error.message || "Failed to resend verification code");
    }
  };

  if (verificationRequired) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: 300 }}>
          <Typography variant="h5" mb={2} textAlign="center">
            Verify Email
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Verification Code"
              variant="outlined"
              fullWidth
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            {error && <Typography color="error">{error}</Typography>}
            <Button
              variant="contained"
              color="primary"
              onClick={handleVerification}
              fullWidth
            >
              Verify
            </Button>
            <Button
              variant="text"
              onClick={handleResendVerificationCode}
              fullWidth
            >
              Resend Code
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  // Your existing return JSX remains the same
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Paper elevation={3} sx={{ padding: 4, width: 300 }}>
        <Typography variant="h5" mb={2} textAlign="center">
          {!isSignUp ? "Login" : "Sign-Up"}
        </Typography>
        <Stack
          component={"form"}
          spacing={2}
          onSubmit={
            isSignUp ? handleSubmit(handleSignUp) : handleSubmit(handleLogin)
          }
        >
          {isSignUp && (
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              helperText={errors?.username?.message as string}
              {...register("username")}
              sx={{ "& .MuiFormHelperText-root": { color: "red" } }}
            />
          )}
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            helperText={errors?.email?.message as string}
            {...register("email")}
            sx={{ "& .MuiFormHelperText-root": { color: "red" } }}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            helperText={errors?.password?.message as string}
            {...register("password")}
            sx={{ "& .MuiFormHelperText-root": { color: "red" } }}
          />
          <FormControl fullWidth>
            <InputLabel id="userRole">User Role</InputLabel>
            <Select
              labelId="userRole"
              id="userRole"
              label="User Role"
              value={watch("userRole")}
              {...register("userRole")}
              sx={{ "& .MuiFormHelperText-root": { color: "red" } }}
            >
              <MenuItem value={"buyer"}>Buyer</MenuItem>
              <MenuItem value={"seller"}>Seller</MenuItem>
            </Select>
          </FormControl>
          {error && <Typography color="error">{error}</Typography>}
          <Button variant="contained" color="primary" type="submit" fullWidth>
            {!isSignUp ? "Login" : "SignUp"}
          </Button>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Button
            variant="text"
            sx={{
              textAlign: "flex-end",
            }}
            onClick={() => {
              setIsSignUp((prev) => !prev);
              reset();
              setError("");
            }}
          >
            {isSignUp ? "Login" : "SignUp"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
