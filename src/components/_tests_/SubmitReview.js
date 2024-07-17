import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import SubmitReview from '../SubmitReview';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

jest.mock('firebase/app');
jest.mock('firebase/auth');
jest.mock('firebase/firestore');

describe('SubmitReview', () => {
  it('submits a review and updates user rating', async () => {
    // Mock current user
    firebase.auth().currentUser = { uid: 'testReviewer' };

    // Mock Firestore methods
    const addMock = jest.fn();
    const updateMock = jest.fn();
    const getMock = jest.fn().mockResolvedValue({
      data: () => ({ averageRating: 4, reviewCount: 1 })
    });

    const firestoreMock = {
      collection: jest.fn(() => ({
        add: addMock,
        doc: jest.fn(() => ({
          update: updateMock,
          get: getMock
        }))
      }))
    };

    firebase.firestore.mockReturnValue(firestoreMock);

    const { getByLabelText, getByText } = render(<SubmitReview revieweeId="testUser" />);

    fireEvent.change(getByLabelText(/rating/i), { target: { value: 5 } });
    fireEvent.change(getByLabelText(/review text/i), { target: { value: 'Great job!' } });
    fireEvent.click(getByText(/submit review/i));

    // Assert Firestore calls
    expect(addMock).toHaveBeenCalled();
    expect(updateMock).toHaveBeenCalled();
    expect(getMock).toHaveBeenCalled();
  });
});