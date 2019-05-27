import { Component, State, Prop } from '@stencil/core';
import ITag from '../../global/interfaces/tag.interface';
import { DataService } from '../../classes/data-service/data.service';
import CollectionNames from '../../global/enums/collection-names.enum';

@Component({ tag: 'tags-component' })
export class TagsComponent {
  @Prop() dataService: DataService
  @State() tags: ITag[] = []
  @State() selectedTag: ITag
  @State() newTag: ITag

  componentWillLoad(){
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
    this.dataService.add(this.newTag, CollectionNames['Tags'])
    this.resetNewTag()
    
  }
  
  submitUpdatedTag(){
    this.dataService.update(this.selectedTag, CollectionNames['Tags'])
    this.selectTag(null)
  }

  selectTag(tag){
    this.selectedTag = Object.assign({}, tag);
  }

  deleteTag(){
    const deleteConfirmed: boolean = window.confirm(`Are you sure you want to delete tag: \n\n ${this.selectedTag.value}`)

    if(deleteConfirmed){
      this.dataService.delete(this.selectedTag, CollectionNames['Tags'])
      this.selectTag(null)
    }
  }

  selectedTagValueChange(event){
    this.selectedTag.value = event.path[0].value
  }

  updateTagName(event){
    this.newTag.value = event.path[0].value
  }
  

  render() {
    return (
      this.tags &&
      <div class='tag-management'>
        <h2>Add Tag</h2>
        <div class="field">
          <span class="field__name">Tag Name: </span>
          <input class="field__input" value={this.newTag.value} onInput={event => this.updateTagName(event)}/>
        </div>
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
                <input 
                  class="field__input" 
                  value={this.selectedTag.value}
                  onInput={event => this.selectedTagValueChange(event)}
                />
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
