


const Header = () => {
  const toggleSidebar = () => {
    const bodyElement = document.getElementsByTagName('body')[0];
    if (bodyElement.classList.contains("sidebar-collapse")) {
      document.body.classList.remove('sidebar-collapse');
    } else {
      document.body.classList.add('sidebar-collapse');
    }
  }
  return (
    <nav className="app-header navbar navbar-expand bg-dark">
      <div className="container-fluid">
        <ul className="navbar-nav">
          <li className="nav-item">
            <a className="nav-link" data-lte-toggle="sidebar" href="#" role="button" onClick={toggleSidebar}>
              <i className="bi bi-list" />
            </a>
          </li>
         
          <ul className="navbar-nav ms-auto">
           
          </ul>
        </ul>

        <ul className="navbar-nav ms-auto">

        
        </ul>

      </div>

    </nav>
  )
}

export default Header