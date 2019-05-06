import { Component, State } from '@stencil/core';
import ITag from '../../interfaces/tag.interface';
import DataService from '../../classes/data-service/data.service';

@Component({ tag: 'tags-component' })
export class TagsComponent {
  @State() tags: ITag[] = []
  @State() selectedTag: ITag
  @State() newTag: ITag
  dataService: DataService

  componentWillLoad(){
    this.dataService = DataService.getSingletonInstance()
    this.dataService.tags$.subscribe((tags: ITag[]) => this.tags = [...tags])
    this.resetNewTag()
  }
  
  resetNewTag(){
    this.newTag = {
      id: null,
      dateLastUpdated: null,
      value: null
    }
  }

  submitNewTag(){
    if(!this.newTag.value){
      return
    }
    this.dataService.add(this.newTag, 'Tags')
    this.resetNewTag()
    
  }
  
  submitUpdatedTag(){
    this.dataService.update(this.selectedTag, 'Tags')
  }

  selectTag(tag){
    this.selectedTag = Object.assign({}, tag);
  }

  deleteTag(){
    const deleteConfirmed: boolean = window.confirm(`Are you sure you want to delete tag: \n\n ${this.selectedTag.value}`)

    if(deleteConfirmed){
      this.dataService.delete(this.selectedTag, 'Tags')
    }
  }


  updateTagName(event){
    this.newTag.value = event.path[0].value
  }

  render() {
    return (
      this.tags &&
      <div class='tag-management'>
        <h3>Add Tag</h3>

          <span class="field__name">Tag Name: </span>
          <input class="field__input" value={this.newTag.value} onInput={event => this.updateTagName(event)}/>
          <button onClick={() => this.submitNewTag()}>Submit</button>

        <hr/>

        <h2>Tags List</h2>
        {this.tags.map((tag: ITag) => {
            return this.selectedTag && this.selectedTag.id == tag.id ?
              <div class="list__item--expanded">
                <hr/>
                <h3>Edit Tag: { tag.value }</h3>
                <div class="field">
                  <span class="field__name">Tag: </span>
                  <input class="field__input" value={this.selectedTag.value}/>
                </div>

                <button onClick={() => this.submitUpdatedTag()}>Update</button>
                <button type="button" onClick={() => this.selectTag(null)}>Close</button>
                <button onClick={() => this.deleteTag()}> Delete</button >
                <hr/>
              </div>
              :
              <div class="list__item" onClick={() => this.selectTag(tag)}>
                { tag.value }
              </div>
        })}
      </div>
    )
  }
}
