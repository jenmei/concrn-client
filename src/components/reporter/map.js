import React from "react"
import { connect } from "react-redux"
import * as types from "actions/types"

import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import MapView from "react-native-maps"
import styled from "styled-components/native"
import * as actions from "actions/reporter"
import ResponderPanel from "components/responder/Panel"
import Modal from "react-native-modalbox"
import * as R from "ramda"

import { Button } from "native-base"

const MapContainer = styled.View`
  position: relative;
  flex: 1;
`
const MarkerContainer = styled.View`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
`

const Marker = styled.Image``

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: "#ff0000",
    borderStyle: "solid",
  },
})

class Map extends React.Component {
  state = {
    region: {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    },
  }

  _regionChanged(region) {
    this.setState({ region })
  }

  createReport(args) {
    this.props.dispatch(
      actions.createReport({
        ...this.state.region,
      }),
    )
  }

  render() {
    const onChoose = () => this.modal.open()
    const onCancel = () => this.modal.close()
    const onChosen = responder => {
      console.log("chosen", responder)
      this.modal.close()
      this.props.dispatch({ type: types.RESPONDER_PARTNER_CHOSEN, responder })
    }

    return (
      <View style={{ flex: 1 }}>
        {this.props.isResponder && <ResponderPanel />}
        <MapContainer>
          <MapView
            style={{ flex: 1 }}
            region={this.state.region}
            onRegionChange={this._regionChanged.bind(this)}
          />
          <MarkerContainer pointerEvents={"none"}>
            <Marker source={require("images/pin.png")} />
          </MarkerContainer>
        </MapContainer>
        <Button full onPress={this.createReport.bind(this)}>
          <Text style={{ color: "white" }}>Start a report</Text>
        </Button>
      </View>
    )
  }
}

export default connect(state => {
  return {
    isResponder: R.pipe(R.path(["auth", "responderId"]), R.isNil(), R.not())(
      state,
    ),
  }
})(Map)
