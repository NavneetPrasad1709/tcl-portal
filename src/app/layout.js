import "./globals.css";

export const metadata = {
  title: "TCL Portal",
  description: "TCL Customer Order Management Portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}