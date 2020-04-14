const preStyle = {
    display: 'block',
    whiteSpace: 'pre',
    fontSize: 11,
    lineHeight: '14px',
    borderBottom: '1px solid #DDD',
    paddingBottom: '8px',
    width: '100vw',
    maxWidth: '100%'
};

const Header = () => (
        <code style={preStyle}>
            ___                      ___<br/>
            |  |                     |  |                   ___<br/>
            |  |                     |  |                   | |<br/>
            |  | ____      ___  _    |  | ____       ____   | |<br/>
            |  |/    \    /   \| |   |  |/    \     /  __\  | |<br/>
            |     /\  |  |  |    |   |     /\  |    \  \    |_|<br/>
            |     \/  |  |  |    |   |     \/  |   __\  \    _ <br/>
            |__|\____/    \___/\__\  |__|\____/    \____/   |_|
        </code>
);

export default Header;