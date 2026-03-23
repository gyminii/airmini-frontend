import Image from "next/image";

export default function Logo() {
  return (
    <Image
      src="/logo.png"
      width={30}
      height={30}
      className="me-1 rounded-[5px]"
      alt="Airmini"
    />
  );
}
