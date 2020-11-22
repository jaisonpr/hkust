import React, { Component } from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet, Modal, Button } from "react-native";
import { Card, Icon, Rating, Input } from "react-native-elements";
import { connect } from 'react-redux';
import * as Animatable from 'react-native-animatable';

import { baseUrl } from '../shared/baseUrl';
import { postFavorite } from '../redux/ActionCreators';

const mapStateToProps = state => {
    return {
      dishes: state.dishes,
      comments: state.comments,
      favorites: state.favorites
    }
}

const mapDispatchToProps = dispatch => ({
    postFavorite: dishId => dispatch(postFavorite(dishId)),
    addComment: (dishId, rating, comment, author) =>
      dispatch(addComment(dishId, rating, comment, author)),
    postComment: (dishId, rating, author, comment) =>
      dispatch(postComment(dishId, rating, author, comment))
});

function RenderComments(props) {

    const comments = props.comments;
            
    const renderCommentItem = ({item, index}) => {
        
        return (
            <View key={index} style={{margin: 10}}>
                <Text style={{fontSize: 14}}>{item.comment}</Text>
                <Text style={{fontSize: 12}}>{item.rating} Stars</Text>
                <Text style={{fontSize: 12}}>{'-- ' + item.author + ', ' + item.date} </Text>
            </View>
        );
    }; 
    
    return (
      <Animatable.View animation="fadeInUp" duration={2000} delay={1000}> 
        <Card title='Comments' >
            <FlatList 
                data={comments}
                renderItem={renderCommentItem}
                keyExtractor={item => item.id.toString()}
                />
        </Card>
      </Animatable.View>      
    );
}

function RenderDish(props) {

    const dish = props.dish;
    
    if (dish != null) {
        return(

          <Animatable.View animation="fadeInDown" duration={2000} delay={1000}>
            <Card featuredTitle={dish.name} image={{uri: baseUrl + dish.image}}>
                <Text style={{margin: 10}}> {dish.description} </Text>                
                <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <Icon
                    raised
                    reverse
                    name={props.favorite ? "heart" : "heart-o"}
                    type="font-awesome"
                    color="#f50"
                    onPress={() =>
                    props.favorite ? console.log("Already favorite") : props.onPress()
                    }
                />
                <Icon
                    raised
                    reverse
                    name="pencil"
                    type="font-awesome"
                    color="#512DA8"
                    onPress={() => props.toggleModal()}
                />
                </View>
            </Card>
          </Animatable.View>
        );
    }
    else {
        return(<View></View>);
    }
}

class DishDetail extends Component {

    constructor(props) {
        super(props);
        this.state = {
          rating: 3,
          author: "",
          comment: "",
          showModal: false
        };
        this.handleComments = this.handleComments.bind(this);
    }

    toggleModal() {
        this.setState({ showModal: !this.state.showModal });
    }
    
    handleComments = dishId => {
        this.toggleModal();
        this.props.postComment(
          dishId,
          this.state.rating,
          this.state.comment,
          this.state.author
        );
    };

    markFavorite(dishId) {
        this.props.postFavorite(dishId);
    }

    static navigationOptions = {
        title: 'Dish Details'
    };

    render() {
        const dishId = this.props.navigation.getParam('dishId','');
        return(
            <ScrollView>
              <RenderDish
                dish={this.props.dishes.dishes[+dishId]}
                favorite={this.props.favorites.some(el => el === dishId)}
                onPress={() => this.markFavorite(dishId)}
                toggleModal={() => this.toggleModal()}
              />
              <RenderComments
                comments={this.props.comments.comments.filter(
                  (comment) => comment.dishId === dishId)}
              />
              <Modal
                animationType={"slide"}
                transparent={false}
                visible={this.state.showModal}
                onDismiss={() => {
                  this.toggleModal();
                }}
                onRequestClose={() => {
                  this.toggleModal();
                }} >
                <View style={styles.formRow}>
                  <Rating
                    showRating
                    fractions={1}
                    startingValue={3.0}
                    onFinishRating={rating => this.setState({ rating: rating })}
                  />
                </View>
                <View style={styles.formRow}>
                  <Input
                    placeholder=" Author"
                    leftIcon={{ type: "font-awesome", name: "user-o" }}
                    onChangeText={value => this.setState({ author: value })}
                  />
                </View>
                <View style={styles.formRow}>
                  <Input
                    placeholder=" Comment"
                    leftIcon={{ type: "font-awesome", name: "comment-o" }}
                    onChangeText={value => this.setState({ comment: value })}
                  />
                </View>
                <View style={{ margin: 10 }}>
                  <Button
                    onPress={() => this.handleComments(dishId)}
                    raised
                    title="Submit"
                    color="#512DA8"
                  />
                </View>
                <View style={{ margin: 10 }}>
                  <Button
                    onPress={() => this.toggleModal()}
                    raised
                    title="Cancel"
                    color="#696969"
                  />
                </View>
              </Modal>
            </ScrollView>
        );
    }
}


const styles = StyleSheet.create({
    formRow: {
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      flexDirection: "row"
    },
    modal: {
      justifyContent: "center",
      margin: 20
    },
    button: {
      flexDirection: "column",
      margin: 20
    }
});


export default connect(mapStateToProps, mapDispatchToProps)(DishDetail);