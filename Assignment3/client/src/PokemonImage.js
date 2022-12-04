import React, {useState} from 'react'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";

function PokemonImage({ pokemon }) {
  const getThreeDigitId = (id) => {
    if (id < 10) return `00${id}`
    if (id < 100) return `0${id}`
    return id
  }

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <img
          src={`https://github.com/fanzeyi/pokemon.json/raw/master/images/${getThreeDigitId(pokemon.id)}.png`}
          onClick={() => setShow(true)}
      />
      <Modal size="lg" show={show} onHide={handleClose} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>{pokemon.name.english}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered hover>
            <thead>
            <tr>
              <th>Number</th>
              <th>HP</th>
              <th>Attack</th>
              <th>Defense</th>
              <th>Special Attack</th>
              <th>Special Defense</th>
              <th>Speed</th>
              <th>Type</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>{pokemon.id}</td>
              <td>{pokemon.base.HP}</td>
              <td>{pokemon.base.Attack}</td>
              <td>{pokemon.base.Defense}</td>
              <td>{pokemon.base["Special Attack"]}</td>
              <td>{pokemon.base["Special Defense"]}</td>
              <td>{pokemon.base.Speed}</td>
              <td>{pokemon.type[0]}, {pokemon.type[1]}</td>
            </tr>
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default PokemonImage
