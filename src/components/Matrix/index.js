import React, { Component, createRef } from "react";
import axios from "axios";
import { connect } from "react-redux";
import { setActiveCard } from "../../redux/actions";
import { bindActionCreators } from "redux";
import smoothscroll from "smoothscroll-polyfill";
import "./Matrix.scss";
import {
  LEFT_CODE,
  RIGHT_CODE,
  UP_CODE,
  DOWN_CODE,
  ESC_CODE,
  PADDING_CARD,
  WIDTH_CARD,
  COUNT_CARDS
} from "../../utils/constant";
import Card from "../Card";
import Loader from "../Loader";

class Matrix extends Component {
  state = {
    images: []
  };

  matrixRef = createRef();

  componentDidMount() {
    smoothscroll.polyfill();
    this.getImages();
    document.addEventListener("keydown", this.moveMatrix);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown");
  }

  componentDidUpdate() {
    if (this.props.activeFromState) {
      document.removeEventListener("keydown", this.moveMatrix);
      document.addEventListener("keydown", this.nextItem);
    } else {
      document.removeEventListener("keydown", this.nextItem);
      document.addEventListener("keydown", this.moveMatrix);
    }
  }

  getBodyScrollTop = () => {
    const el = document.scrollingElement || document.documentElement;

    return el.scrollTop;
  };

  getBodyScrollLeft = () => {
    const el = document.scrollingElement || document.documentElement;

    return el.scrollLeft;
  };

  moveMatrix = event => {
    if (
      [LEFT_CODE, RIGHT_CODE, UP_CODE, DOWN_CODE].indexOf(event.keyCode) > -1
    ) {
      event.preventDefault();
    }

    if (event.keyCode === UP_CODE) {
      window.scrollBy({
        top: -1 * (window.innerHeight / 3),
        behavior: "smooth"
      });

      if (this.getBodyScrollTop() === 0) {
        window.scrollTo({
          top: this.matrixRef.current.scrollHeight,
          behavior: "smooth"
        });
      }
    } else if (event.keyCode === DOWN_CODE) {
      window.scrollBy({
        top: window.innerHeight / 3,
        behavior: "smooth"
      });

      if (
        this.matrixRef.current.scrollHeight - this.getBodyScrollTop() <=
        window.innerHeight
      ) {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }
    } else if (event.keyCode === LEFT_CODE) {
      window.scrollBy({
        left: -1 * (window.innerWidth / 3),
        behavior: "smooth"
      });

      if (this.getBodyScrollLeft() === 0) {
        window.scrollTo({
          left: this.matrixRef.current.scrollWidth,
          behavior: "smooth"
        });
      }
    } else if (event.keyCode === RIGHT_CODE) {
      window.scrollBy({
        left: window.innerWidth / 3,
        behavior: "smooth"
      });

      if (
        this.matrixRef.current.scrollWidth - this.getBodyScrollLeft() <=
        window.innerWidth
      ) {
        window.scrollTo({
          left: 0,
          behavior: "smooth"
        });
      }
    }
  };

  nextItem = event => {
    // Disable native scroll
    if (
      [LEFT_CODE, RIGHT_CODE, UP_CODE, DOWN_CODE, ESC_CODE].indexOf(
        event.keyCode
      ) > -1
    ) {
      event.preventDefault();
    }

    if (event.keyCode === UP_CODE && this.props.rowFromState > 0) {
      this.props.setActiveCard({
        active: true,
        row: this.props.rowFromState - 1,
        number: this.props.numberFromState - this.getCountInRow()
      });

      this.scrollVertical(this.props.numberFromState);
    } else if (
      event.keyCode === DOWN_CODE &&
      this.props.rowFromState <
        parseInt((this.state.images.length - 1) / this.getCountInRow()) &&
      this.props.numberFromState + this.getCountInRow() <=
        this.state.images.length - 1
    ) {
      this.props.setActiveCard({
        active: true,
        row: this.props.rowFromState + 1,
        number: this.props.numberFromState + this.getCountInRow()
      });

      this.scrollVertical(this.props.numberFromState);
    } else if (event.keyCode === LEFT_CODE && this.props.numberFromState > 0) {
      this.props.setActiveCard({
        active: true,
        row: this.props.rowFromState,
        number: this.props.numberFromState - 1
      });

      this.scrollHorizontal(this.props.numberFromState);
      this.checkNextCardAndScroll(this.props.numberFromState);
    } else if (
      event.keyCode === RIGHT_CODE &&
      this.props.numberFromState < this.state.images.length - 1
    ) {
      this.props.setActiveCard({
        active: true,
        row: this.props.rowFromState,
        number: this.props.numberFromState + 1
      });

      this.scrollHorizontal(this.props.numberFromState);
      this.checkNextCardAndScroll(this.props.numberFromState);
    } else if (event.keyCode === 27) {
      this.props.setActiveCard({
        active: false,
        row: 0,
        number: 0
      });
    }
  };

  scrollVertical = number => {
    let el = document.querySelector(`a[data-number="${number}"]`);
    let offsetTop = el.getBoundingClientRect().top;
    let options = {};

    if (window.innerHeight - offsetTop < 400) {
      options["top"] = window.innerHeight / 2;
    } else if (offsetTop < 100) {
      options["top"] = -1 * (window.innerHeight / 2);
    }

    window.scrollBy({
      ...options,
      behavior: "smooth"
    });
  };

  scrollHorizontal = number => {
    let el = document.querySelector(`a[data-number="${number}"]`);
    let offsetLeft = el.getBoundingClientRect().left;
    let options = {};

    if (window.innerWidth - offsetLeft < 400) {
      options["left"] = window.innerWidth / 2;
    } else if (offsetLeft < 100) {
      options["left"] = -1 * (window.innerWidth / 2);
    }

    window.scrollBy({
      ...options,
      behavior: "smooth"
    });
  };

  checkNextCardAndScroll = number => {
    let options = {};

    if (number % this.getCountInRow() === 0) {
      options["left"] = -1 * this.matrixRef.current.scrollWidth;
    }

    if ((number + 1) % this.getCountInRow() === 0) {
      options["left"] = this.matrixRef.current.scrollWidth;
    }

    window.scrollBy({
      ...options,
      behavior: "smooth"
    });
  };

  getImages = async () => {
    let data = [];
    let res = await axios.all([
      axios.get("https://picsum.photos/v2/list?page=2&limit=100"),
      axios.get("https://picsum.photos/v2/list?page=3&limit=100"),
      axios.get("https://picsum.photos/v2/list?page=4&limit=100")
    ]);

    res.forEach(item => {
      data.push(...item.data);
    });

    this.setState({ images: data });
  };

  getCountInRow = () => {
    let width = this.matrixRef.current.getBoundingClientRect().width;
    let count = width / (WIDTH_CARD + PADDING_CARD);

    return parseInt(count);
  };

  render() {
    const stylesMatrix = {
      width: (PADDING_CARD + WIDTH_CARD) * COUNT_CARDS
    };
    return (
      <div style={stylesMatrix} ref={this.matrixRef} className="matrix">
        {this.state.images.length === 0 ? (
          <Loader />
        ) : (
          this.state.images.map((img, i) => {
            return (
              <Card
                key={i}
                url={img.download_url}
                number={i}
                author={img.author}
                row={parseInt(i / this.getCountInRow())}
              />
            );
          })
        )}
      </div>
    );
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      setActiveCard
    },
    dispatch
  );

const mapStateToProps = state => ({
  rowFromState: state.row,
  numberFromState: state.number,
  activeFromState: state.active
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Matrix);
