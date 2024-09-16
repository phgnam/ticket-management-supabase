import { urlPath } from "@/utils/url-helpers";
import Link from "next/link";
export default function ErrorPage({ searchParams, params }: any) {
  const { type } = searchParams;
  const knownErrors = [
    "login-failed",
    "magiclink",
    "invalid_magiclink",
    "register_mail_mismatch",
  ];
  return (
    <div style={{ textAlign: "center" }}>
      <h1>Ooops!</h1>
      {type === "login-failed" && (
        <strong>Login was not successfull, sorry.</strong>
      )}
      {type === "invalid_magiclink" && (
        <strong>
          The magic link was invalid. Maybe it expired? Please request a new
          one.
        </strong>
      )}
      {type === "magiclink" && (
        <strong>
          Could not send a magic link. Maybe you had a typo in your E-Mail?
        </strong>
      )}
      {type === "register_mail_mismatch" && (
        <strong>
          You are not legitimated to register an account with{" "}
          <u>{searchParams.email}.</u>
        </strong>
      )}
      {type === "register_mail_exists" && (
        <strong>
          There is already an account registered with &nbsp;
          <u>{searchParams.email}</u>.{" "}
        </strong>
      )}
      {type === "register_unknown" && (
        <strong>
          Sorry but an unknown error occurred when trying to create an account.
        </strong>
      )}
      <br />
      <br />
      <Link role="button" href={urlPath("/", params.tenant)}>
        Go back.
      </Link>
    </div>
  );
}
