import "@/asset/styles/globals.css";

const Layout = ({ children }) => {
  return (
    <html>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
};

export default Layout;
