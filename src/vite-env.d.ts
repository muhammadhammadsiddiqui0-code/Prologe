/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional absolute URL of the contact endpoint. Defaults to "/api/contact". */
  readonly VITE_CONTACT_ENDPOINT?: string;
}
