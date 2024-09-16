"use client";
import ErrorPage from "next/error";
export default function notFound() {
  return (<ErrorPage statusCode={404} />);
}
