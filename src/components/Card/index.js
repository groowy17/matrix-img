import React, { Component, createRef } from "react";
import { connect } from "react-redux";
import { setActiveCard } from "../../redux/actions";
import { bindActionCreators } from "redux";
import { getImageUrl, getImageUrl2x } from "../../utils";
import { WIDTH_CARD } from "../../utils/constant";
import "./Card.scss";

class Card extends Component {
  cardRef = createRef();

  componentDidMount() {
    if (!window["IntersectionObserver"]) {
      this.setSourceImg();
    } else {
      this.createObserver();
    }
  }

  setSourceImg = () => {
    this.picRef.srcset = `${getImageUrl(this.props.url)} 1x, 
                          ${getImageUrl2x(this.props.url)} 2x`;
  };

  createObserver = () => {
    let observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const { isIntersecting } = entry;
          if (isIntersecting) {
            this.setSourceImg();
            observer = observer.disconnect();
          }
        });
      },
      {
        rootMargin: "200px"
      }
    );

    observer.observe(this.picRef);
  };

  handlerChangeActiveCard = event => {
    event.preventDefault();
    this.cardRef.current.focus();

    this.props.setActiveCard({
      active: true,
      number: this.props.number,
      row: this.props.row
    });
  };

  handlerBlur = () => {
    this.props.setActiveCard({
      active: false,
      number: 0,
      row: 0
    });
  };

  render() {
    const stylesCard = {
      width: WIDTH_CARD
    };
    return (
      <a
        href="/#"
        ref={this.cardRef}
        className="card"
        data-number={this.props.number}
        data-row={this.props.row}
        onClick={this.handlerChangeActiveCard}
        onFocus={this.handlerChangeActiveCard}
        onBlur={this.handlerBlur}
        style={stylesCard}
      >
        <picture className="card__picture">
          <source type="image/jpeg" ref={el => (this.picRef = el)} />
          <img className="card__img" alt={this.props.author} />
        </picture>
        {this.props.activeFromState &&
          this.props.number === this.props.numberFromState && (
            <div
              className={
                "card__info " +
                (this.cardRef.current.parentNode.clientWidth -
                  this.cardRef.current.offsetLeft <
                this.cardRef.current.clientWidth * 2
                  ? "card__info_right "
                  : "") +
                (this.cardRef.current.parentNode.scrollHeight -
                  this.cardRef.current.offsetTop <
                this.cardRef.current.clientHeight * 2
                  ? "card__info_top "
                  : "")
              }
            >
              <picture className="card__picture">
                <source
                  type="image/jpeg"
                  srcSet={getImageUrl2x(this.props.url)}
                />
                <img className="card__img" alt={this.props.author} />
              </picture>
              <div className="card__text">{this.props.author}</div>
            </div>
          )}
      </a>
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
)(Card);
