import styled from "@emotion/styled";

// export const FormContainer = styled.form``;

export const FormContainer = styled.form`
    display: flex;
    justify-content: inherit;
`;

export const SignupFieldContainer = styled.div`
    /* @media (min-width: 768px) {
        display: flex;
        flex-direction: row;
    } */
    align-items: center;
    flex-direction: row;
    display: flex;
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
export const Button = styled.div`
    position: absolute;
    min-height: 2rem;
    min-width: 2rem;

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
`;

export const Terms = styled.div`
    margin-top: 0.25rem;
    margin-bottom: 2rem;
    font-size: 0.75rem;
    line-height: 0.75rem;
    color: gray;
`;

export const Error = styled.div`
    position: absolute;
    margin-left: -100px;
    width: 200px;
    left: 50%;
    top: -20px;
    font-size: 0.75rem;
    line-height: 0.75rem;
    color: gray;
`;
