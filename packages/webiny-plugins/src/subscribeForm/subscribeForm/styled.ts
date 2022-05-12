import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";

// export const FormContainer = styled.form``;

const loadingSpinner = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }

`;

export const FormContainer = styled.form`
  width: 100%;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: inherit;
  justify-content: center;
`;

export const SignupFieldContainer = styled.div`
  /* @media (min-width: 768px) {
        display: flex;
        flex-direction: row;
    } */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.25rem;
  position: relative;
`;
export const InputContainer = styled.div`
  justifycontent: flex-end;
`;

export const Input = styled.input`
  width: 100%;
  font-family: "Montserrat";
  color: black;
  padding: 0.5rem 1rem;
  font-weight: 600;
  padding-right: 6rem;
  font-size: 1rem;
  line-height: 2rem;
  font-weight: 600;
  background-color: white;
  border-width: 0;
  border-radius: 24px;
  ::placeholder {
    color: rgba(107, 114, 128);
  }
  filter: drop-shadow(0 0 0.75rem gray);
`;
export const Button = styled.button`
  display: inline-block;
  border: none;
  padding: 1rem 2rem;
  margin: 0;
  text-decoration: none;
  background: #0069ed;
  color: #ffffff;
  font-family: sans-serif;
  font-size: 1rem;
  cursor: pointer;
  text-align: center;
  transition: background 250ms ease-in-out, transform 150ms ease;
  -webkit-appearance: none;
  -moz-appearance: none;
  position: absolute;
  min-height: 2rem;
  min-width: 6rem;
  right: 0;
  font-family: "Montserrat";
  color: white;
  font-weight: 800;
  border-radius: 24px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  line-height: 2rem;
  background-image: linear-gradient(
    45deg,
    rgba(0, 255, 170, 1),
    rgba(69, 121, 245, 1),
    rgba(156, 66, 245, 1)
  );
`;

export const CompletedText = styled.p`
  margin: auto;
  max-width: 640px;
  text-align: center;
  @media (min-width: 768px) {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }
  margin-bottom: 2.5rem;
  font-size: 1rem;
  line-height: 1;
  font-weight: 800;
`;

export const TermsContainer = styled.div`
  position: relative;
  text-align: center;
`;

export const Terms = styled.div`
  margin-top: 0.25rem;
  margin-bottom: 2rem;
  font-size: 0.75rem;
  line-height: 0.75rem;
  color: gray;
`;

export const Error = styled.div`
  font-size: 0.75rem;
  line-height: 0.75rem;
  color: gray;
`;

export const Spinner = styled.div`
  border: 0.2em solid #fff;
  border-top-color: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  width: 2em;
  height: 2em;
  animation: ${loadingSpinner} 2s linear infinite;
  margin: 0 auto;
  box-sizing: border-box;
`;
