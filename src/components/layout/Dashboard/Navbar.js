import { Link } from "react-router-dom";
import Logo from "../../../assets/img/GiziBalita_logo.png";

const Navbar = ({ navbarLink }) => {
  return (
    <div
      style={{ background: "#ffb4b4" }}
      className={`flex mt-12 lg:ml-20 justify-between max-h-[60px] w-full duration-300 pr-32 pl-8 py-4 shadow-sm z-10`}
    >
      <div>
        <img
          src={Logo}
          alt="Image"
          style={{
            width: "100px",
            height: "auto",
            marginBottom: "10px",
          }}
        />
      </div>
      <div className="flex gap-4">
        {navbarLink.map((link, index) => {
          return (
            <Link
              to={link.path}
              key={index}
              className="text-white hover:bg-rose-400 "
            >
              {link.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Navbar;
